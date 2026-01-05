import { supabase } from './supabaseClient';
import { VolunteerFormData, AdminTab } from '../types';

export class VolunteerServiceSupabase {

    // Check if a member already exists by clean phone or exact name match
    // Returns the member object if found, null otherwise
    static async findExistingMember(phone: string, name: string): Promise<any | null> {
        // Clean phone for comparison (assuming DB stores numbers only)
        const cleanPhone = phone.replace(/\D/g, '');

        // Try by Phone first (more unique)
        if (cleanPhone.length > 8) {
            const { data: byPhone, error: errPhone } = await supabase
                .from('members')
                .select('*')
                .ilike('phone', `%${cleanPhone}%`) // Simple match, can be improved
                .maybeSingle();

            if (byPhone) return byPhone;
        }

        // Try by Name if no phone match
        const { data: byName, error: errName } = await supabase
            .from('members')
            .select('*')
            .ilike('name', name)
            .maybeSingle();

        return byName || null;
    }

    // App Settings (Global Config)
    static async getSettings() {
        const { data, error } = await supabase
            .from('app_settings')
            .select('*')
            .single();

        if (error) {
            console.error("Error fetching settings:", error);
            return null;
        }
        return data;
    }

    static async updateSettings(settings: any) {
        // We assume single row logic, so we update where true (or fetch ID first)
        // Since we have only one row, we can fetch it to get ID or just update all rows (limit 1)
        // Better: get ID first
        const current = await this.getSettings();
        if (current?.id) {
            const { error } = await supabase
                .from('app_settings')
                .update({ ...settings, updated_at: new Date() })
                .eq('id', current.id);

            if (error) throw error;
        }
    }

    // Main registration flow
    static async processRegistration(formData: VolunteerFormData): Promise<VolunteerFormData> {
        try {
            // 1. Check if member exists
            let memberId = null;
            const existingMember = await this.findExistingMember(formData.telefone || '', formData.nomeCompleto);

            if (existingMember) {
                memberId = existingMember.id;
                console.log("Member found, linking to ID:", memberId);

                // Update member details just in case (e.g. marital status changed)
                await supabase
                    .from('members')
                    .update({
                        marital_status: formData.estadoCivil,
                        birth_date: formData.dataNascimento,
                        phone: formData.telefone
                    })
                    .eq('id', memberId);
            } else {
                // 2a. Fetch a valid Church ID (HEADQUARTERS or First available)
                // This prevents FK errors if the hardcoded ID doesn't exist in PROD
                const { data: churchData, error: churchError } = await supabase
                    .from('churches')
                    .select('id')
                    .limit(1)
                    .maybeSingle();

                if (!churchData?.id) {
                    throw new Error("Erro crítico: Nenhuma igreja encontrada no banco de dados para vincular o novo membro.");
                }

                // 2b. Create new Member (Visitor)
                const { data: newMember, error: createError } = await supabase
                    .from('members')
                    .insert([{
                        name: formData.nomeCompleto,
                        phone: formData.telefone,
                        birth_date: formData.dataNascimento,
                        marital_status: formData.estadoCivil, // Ensure enum matches or cast
                        type: 'VISITOR', // Default for new form entries
                        status: 'ACTIVE',
                        church_id: churchData.id
                    }])
                    .select()
                    .single();

                if (createError) throw new Error("Erro ao criar perfil/membro: " + createError.message);
                memberId = newMember.id;
            }

            // 3. Create Volunteer Record
            const { data: vol, error: volError } = await supabase
                .from('volunteers')
                .insert([{
                    member_id: memberId,
                    ministerio_interesse: formData.ministerioIdentificacao,
                    disponibilidade_treinamento: formData.disponivelTreinamento,
                    aceita_principios: formData.aceitaPrincipios,
                    escola_reino: formData.escolaReino,
                    status_cadastro: 'Apto para Análise Final',
                    dating: formData.estaNamorando,
                    partner_religion: formData.religiaoNamorado,
                    has_addiction: formData.possuiVicios,
                    addiction_details: formData.vicioDescricao
                }])
                .select()
                .single();

            if (volError) throw new Error("Erro ao registrar voluntário: " + volError.message);

            return { ...formData, id: vol.id, statusCadastro: vol.status_cadastro };

        } catch (error) {
            console.error("Registration Error:", error);
            throw error;
        }
    }

    // Fetch volunteers for Admin Panel
    static async getVolunteers(): Promise<VolunteerFormData[]> {
        const { data, error } = await supabase
            .from('volunteers')
            .select(`
                id,
                ministerio_interesse,
                status_cadastro,
                dating,
                partner_religion,

                has_addiction,
                addiction_details,
                escola_reino,
                aceita_principios,
                disponibilidade_treinamento,
                created_at,
                members (
                    name,
                    phone,
                    birth_date,
                    marital_status
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching volunteers:", error);
            return [];
        }

        // Map Supabase response to Frontend Model
        return data.map((v: any) => ({
            id: v.id,
            nomeCompleto: v.members?.name || 'Desconhecido',
            telefone: v.members?.phone || '',
            dataNascimento: v.members?.birth_date || '',
            dataCadastro: new Date(v.created_at).toLocaleDateString(),
            estadoCivil: v.members?.marital_status || 'Solteiro(a)',
            ministerioIdentificacao: v.ministerio_interesse,
            statusCadastro: v.status_cadastro,
            // Defaults for fields not in DB yet or derived
            batizado: true, // Assuming true if applying, logic can be improved
            aceitaPrincipios: v.aceita_principios,
            escolaReino: v.escola_reino,
            estaNamorando: v.dating || false,
            religiaoNamorado: v.partner_religion || '',
            possuiVicios: v.has_addiction || 'Não',
            vicioDescricao: v.addiction_details,
            disponivelTreinamento: v.disponibilidade_treinamento
        }));
    }

    // Update Status
    static async updateVolunteerStatus(id: string, newStatus: string, obs: string) {
        const { error } = await supabase
            .from('volunteers')
            .update({ status_cadastro: newStatus, observacoes_internas: obs })
            .eq('id', id);

        if (error) throw error;
    }

    // Delete Volunteer
    static async deleteVolunteer(id: string) {
        // Debug: Check Session
        const { data: { session } } = await supabase.auth.getSession();
        console.log(`[Delete] Current Session User: ${session?.user?.id || 'ANONYMOUS'}`);
        console.log(`[Delete] Attempting to delete volunteer with ID: ${id}`);
        const { error, count } = await supabase
            .from('volunteers')
            .delete({ count: 'exact' }) // Request count of deleted rows
            .eq('id', id);

        if (error) {
            console.error("Error deleting volunteer:", error);
            throw error;
        }

        console.log(`Deletion result - Rows deleted: ${count}`);

        if (count === 0) {
            console.warn("Delete operation returned 0 rows affected. This might be due to RLS policies preventing deletion.");
            throw new Error("Não foi possível excluir o voluntário. Verifique se você tem permissão ou se o registro já foi removido.");
        }
    }

    // Ministries Management
    // Returns list of active ministry names
    static async getMinistries(): Promise<string[]> {
        const { data, error } = await supabase
            .from('ministries')
            .select('name')
            .eq('active', true)
            .order('name');

        if (error) {
            console.error("Error fetching ministries:", error);
            return [];
        }
        return data.map((m: any) => m.name);
    }

    static async addMinistry(name: string): Promise<void> {
        // Check if exists (deleted or active)
        const { data: existing } = await supabase
            .from('ministries')
            .select('*')
            .ilike('name', name)
            .maybeSingle();

        if (existing) {
            // activate if inactive
            if (!existing.active) {
                await supabase.from('ministries').update({ active: true }).eq('id', existing.id);
            }
            return;
        }

        const { error } = await supabase
            .from('ministries')
            .insert([{ name, active: true }]);

        if (error) throw error;
    }

    static async removeMinistry(name: string): Promise<void> {
        // Soft delete (set active = false) or hard delete. 
        // For simplicity in MVP, hard delete if no constraints, or soft delete preferred.
        // Let's do hard delete for now to match expectations of "remover", 
        // but robust systems usually soft delete. 
        // Given the script allows delete:
        const { error } = await supabase
            .from('ministries')
            .delete()
            .eq('name', name);

        if (error) {
            console.error("Error removing ministry:", error);
            // Fallback to soft delete if FK constraint fails? 
            // For now, assume no FKs from Volunteers yet enforce it (actually volunteers table stores TEXT name, not FK)
            // So hard delete is fine.
        }
    }

    // Training Management

    // Fetch Training Progress for all volunteers
    static async getTrainingProgress(): Promise<any[]> {
        // We get volunteers who are in relevant statuses (e.g. not 'Reprovado' or maybe all?)
        // Let's fetch all volunteers and their progress
        const { data, error } = await supabase
            .from('volunteers')
            .select(`
                id,
                status_cadastro,
                members ( name ),
                training_progress ( class_number, completed, completed_at )
            `)
            .or('status_cadastro.eq.Pendente – Escola do Reino,status_cadastro.eq.Encaminhado para Integração,status_cadastro.eq.Apto para Análise Final,status_cadastro.eq.Aprovado')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching training:", error);
            return [];
        }

        return data.map((v: any) => {
            // Transform progress array into a fixed structure or map
            const progressMap: Record<number, boolean> = {};
            v.training_progress?.forEach((p: any) => {
                progressMap[p.class_number] = p.completed;
            });

            // Assuming 3 standard classes for now
            const classes = [1, 2, 3].map(num => progressMap[num] || false);

            return {
                volunteerId: v.id,
                nomeCompleto: v.members?.name || 'Desconhecido',
                status: v.status_cadastro,
                dataInicio: 'N/A', // We don't track start date explicitly yet, could use created_at
                aulas: classes
            };
        });
    }

    static async updateTrainingAttendance(volunteerId: string, classNumber: number, completed: boolean): Promise<void> {
        // Upsert logic
        const { error } = await supabase
            .from('training_progress')
            .upsert({
                volunteer_id: volunteerId,
                class_number: classNumber,
                completed: completed,
                completed_at: completed ? new Date() : null,
                updated_at: new Date()
            }, { onConflict: 'volunteer_id,class_number' });

        if (error) throw error;
    }

    static simulateSheetSync(data: any) { return Promise.resolve(); }
}
