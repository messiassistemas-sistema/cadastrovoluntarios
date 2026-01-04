import React, { useState, useMemo, useEffect } from 'react'; // Force redeploy
import { VolunteerFormData, TrainingRecord, AdminTab } from '../types';
import { VolunteerServiceSupabase as VolunteerService } from '../services/VolunteerServiceSupabase';
import { useConfig } from '../contexts/ConfigContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const ConfigurationSection: React.FC = () => {
    const { appName, orgName, logoUrl, registrationOpen, updateConfig } = useConfig();

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateConfig({ logoUrl: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                <i className="fas fa-paintbrush text-indigo-600"></i>
                Identidade Visual
            </h3>
            <p className="text-slate-500 text-sm mb-6">
                Personalize o nome do portal e o logotipo.
            </p>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl mb-6 flex items-center justify-between">
                <div>
                    <h4 className="font-bold text-slate-800">Status do Cadastro</h4>
                    <p className="text-xs text-slate-500">
                        {registrationOpen
                            ? "O formulário está ABERTO para novos voluntários."
                            : "O formulário está FECHADO. Apenas a tela de aviso será exibida."}
                    </p>
                </div>
                <button
                    onClick={() => updateConfig({ registrationOpen: !registrationOpen })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${registrationOpen ? 'bg-green-500' : 'bg-slate-300'}`}
                >
                    <span
                        className={`${registrationOpen ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Nome do Aplicativo</label>
                        <input
                            type="text"
                            value={appName}
                            onChange={(e) => updateConfig({ appName: e.target.value })}
                            className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Nome da Organização</label>
                        <input
                            type="text"
                            value={orgName}
                            onChange={(e) => updateConfig({ orgName: e.target.value })}
                            className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Logotipo</label>
                    <div className="flex items-center gap-4">
                        <div className="w-24 h-24 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative">
                            {logoUrl ? (
                                <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                            ) : (
                                <span className="text-slate-300 text-xs text-center p-2">Sem logo</span>
                            )}
                        </div>
                        <div className="flex-1">
                            <label className="block w-full cursor-pointer bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-2 px-4 rounded-lg text-center transition-colors text-sm">
                                <i className="fas fa-upload mr-2"></i> Alterar Logo
                                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                            </label>
                            {logoUrl && (
                                <button
                                    onClick={() => updateConfig({ logoUrl: null })}
                                    className="mt-2 text-red-500 text-xs font-bold hover:underline"
                                >
                                    Remover Logo
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};



// Define types locally if not yet in types.ts or import
type UserRole = 'ADMIN' | 'SECRETARIA' | null;

interface AdminPanelProps {
    userRole: UserRole;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ userRole }) => {
    const [volunteers, setVolunteers] = useState<VolunteerFormData[]>([]);
    const [selectedVolunteer, setSelectedVolunteer] = useState<VolunteerFormData | null>(null);
    const [ministries, setMinistries] = useState<string[]>([]);
    const [training, setTraining] = useState<TrainingRecord[]>([]);
    const [filter, setFilter] = useState('');
    const [tab, setTab] = useState<AdminTab>('DASHBOARD');
    const [sheetsConfig, setSheetsConfig] = useState({ name: 'MVP – Cadastro de Voluntários', status: 'Conectado', lastSync: new Date().toLocaleTimeString() });

    // Fetch Real Data
    useEffect(() => {
        const load = async () => {
            console.log("Iniciando carregamento de dados...");

            // Voluntários
            try {
                const vols = await VolunteerService.getVolunteers();
                console.log("Voluntários carregados:", vols.length);
                setVolunteers(vols);
            } catch (e) {
                console.error("Erro ao carregar voluntários:", e);
            }

            // Ministérios
            try {
                const mins = await VolunteerService.getMinistries();
                console.log("Ministérios carregados:", mins.length);
                setMinistries(mins);
            } catch (e) {
                console.error("Erro ao carregar ministérios:", e);
            }

            // Treinamentos
            try {
                const train = await VolunteerService.getTrainingProgress();
                console.log("Treinamentos carregados:", train.length);
                setTraining(train);
            } catch (e) {
                console.error("Erro ao carregar treinamentos:", e);
            }
        };
        load();
    }, []);

    const stats = useMemo(() => {
        const totalCount = volunteers.length;
        const aptosCount = volunteers.filter(v => v.statusCadastro === 'Apto para Análise Final' || v.statusCadastro === 'Aprovado').length;
        const integracaoCount = volunteers.filter(v => v.statusCadastro === 'Encaminhado para Integração').length;
        const escolaCount = volunteers.filter(v => v.statusCadastro === 'Pendente – Escola do Reino').length;

        const divisor = totalCount || 1;
        const aptosPerc = (aptosCount / divisor) * 100;
        const integracaoPerc = (integracaoCount / divisor) * 100;
        const escolaPerc = (escolaCount / divisor) * 100;

        const ministriesCount: Record<string, number> = {};
        volunteers.forEach(v => {
            const min = v.ministerioIdentificacao || 'Não especificado';
            ministriesCount[min] = (ministriesCount[min] || 0) + 1;
        });

        return {
            total: totalCount,
            aptos: aptosCount,
            integracao: integracaoCount,
            escola: escolaCount,
            aptosPerc,
            integracaoPerc,
            escolaPerc,
            ministriesCount
        };
    }, [volunteers]);

    const filteredVolunteers = volunteers.filter(v =>
        v.nomeCompleto.toLowerCase().includes(filter.toLowerCase()) ||
        v.statusCadastro?.toLowerCase().includes(filter.toLowerCase())
    );

    const updateVolunteerStatus = async (id: string, newStatus: string, obs: string) => {
        try {
            await VolunteerService.updateVolunteerStatus(id, newStatus, obs);
            // Optimistic update
            setVolunteers(prev => prev.map(v => v.id === id ? { ...v, statusCadastro: newStatus, observacoesInternas: obs } : v));
        } catch (e) {
            alert("Erro ao atualizar status");
        }
    };

    const getWhatsAppLink = (v: VolunteerFormData) => {
        let message = "";
        switch (v.statusCadastro) {
            case 'Encaminhado para Integração': message = "Olá! Recebemos seu cadastro. Para seguir no voluntariado, precisamos caminhar juntos no processo de integração. Nossa equipe entrará em contato em breve 🤍"; break;
            case 'Pendente – Escola do Reino': message = "Seu cadastro foi recebido com alegria! Para avançarmos, é necessário estar matriculado(a) na Escola do Reino. Qualquer dúvida, estamos à disposição 🙏"; break;
            case 'Apto para Análise Final': message = "Que alegria! 🎉 Seu cadastro avançou para a próxima etapa do voluntariado da MVP. Em breve entraremos em contato com mais orientações."; break;
            case 'Aprovado': message = "Parabéns! 🎊 Seu cadastro como voluntário da MVP foi APROVADO. Seja muito bem-vindo ao corpo de serviço!"; break;
            case 'Reprovado': message = "Olá, aqui é da equipe de voluntariado da MVP. Gostaríamos de conversar sobre seu cadastro."; break;
            default: message = "Olá, aqui é da equipe de voluntariado da MVP! Gostaria de conversar sobre seu cadastro.";
        }
        return `https://wa.me/${v.telefone || '5500000000000'}?text=${encodeURIComponent(message)}`;
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFillColor(49, 46, 129); // indigo-900
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text("Relatório de Voluntários", 105, 20, { align: 'center' });
        doc.setFontSize(10);
        doc.text("Portal MVP - Ministério Vida na Palavra", 105, 30, { align: 'center' });

        // Info
        doc.setTextColor(100);
        doc.text(`Gerado em: ${new Date().toLocaleDateString()} às ${new Date().toLocaleTimeString()}`, 14, 48);
        doc.text(`Total de registros: ${filteredVolunteers.length}`, 14, 54);

        // Table
        const tableColumn = ["Nome", "Data Cadastro", "Dons/Ministério", "Status", "Telefone"];
        const tableRows = filteredVolunteers.map(v => [
            v.nomeCompleto,
            v.dataCadastro,
            v.ministerioIdentificacao || 'N/A',
            v.statusCadastro,
            v.telefone || 'N/A'
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 60,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [79, 70, 229] } // indigo-600
        });

        doc.save(`voluntarios_mvp_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const handleExportExcel = () => {
        const workSheet = XLSX.utils.json_to_sheet(filteredVolunteers.map(v => ({
            "ID": v.id,
            "Nome Completo": v.nomeCompleto,
            "Data Cadastro": v.dataCadastro,
            "Nascimento": v.dataNascimento,
            "Estado Civil": v.estadoCivil,
            "Batizado": v.batizado ? "Sim" : "Não",
            "Ministério": v.ministerioIdentificacao,
            "Status": v.statusCadastro,
            "Telefone": v.telefone
        })));

        const workBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workBook, workSheet, "Voluntários");

        // Adjust column width
        const wscols = [
            { wch: 5 }, { wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 25 }, { wch: 25 }, { wch: 15 }
        ];
        workSheet['!cols'] = wscols;

        XLSX.writeFile(workBook, `voluntarios_mvp_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <div className="max-w-6xl mx-auto px-4 pb-20 animate-fadeIn" role="main">
            {/* Modal de Detalhes */}
            {selectedVolunteer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-slate-100 flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Detalhes do Voluntário</h3>
                                <p className="text-sm text-slate-500">Visualizando cadastro completo</p>
                            </div>
                            <button
                                onClick={() => setSelectedVolunteer(null)}
                                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xl">
                                    <i className="fas fa-user"></i>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-lg">{selectedVolunteer.nomeCompleto}</h4>
                                    <p className="text-slate-500 text-sm">{selectedVolunteer.statusCadastro}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h5 className="font-bold text-slate-700 border-b border-slate-100 pb-2">Dados Pessoais</h5>

                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">Data de Nascimento</p>
                                        <p className="text-slate-700">{selectedVolunteer.dataNascimento}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">Estado Civil</p>
                                        <p className="text-slate-700">{selectedVolunteer.estadoCivil}</p>
                                        {selectedVolunteer.estaNamorando && (
                                            <p className="text-sm text-slate-500 mt-1">
                                                Namorando (Religião: {selectedVolunteer.religiaoNamorado})
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">Contato</p>
                                        <p className="text-slate-700">{selectedVolunteer.telefone || 'Não informado'}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h5 className="font-bold text-slate-700 border-b border-slate-100 pb-2">Vida Eclesiástica</h5>

                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">Batizado</p>
                                        <p className="text-slate-700 flex items-center gap-2">
                                            {selectedVolunteer.batizado ? (
                                                <><i className="fas fa-check text-green-500"></i> Sim</>
                                            ) : (
                                                <><i className="fas fa-times text-red-500"></i> Não</>
                                            )}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">Escola do Reino</p>
                                        <p className="text-slate-700 flex items-center gap-2">
                                            {selectedVolunteer.escolaReino ? (
                                                <><i className="fas fa-check text-green-500"></i> Sim</>
                                            ) : (
                                                <><i className="fas fa-times text-red-500"></i> Não</>
                                            )}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">Concorda com Princípios</p>
                                        <p className="text-slate-700 flex items-center gap-2">
                                            {selectedVolunteer.aceitaPrincipios ? (
                                                <><i className="fas fa-check text-green-500"></i> Sim</>
                                            ) : (
                                                <><i className="fas fa-times text-red-500"></i> Não</>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                                <div className="space-y-4">
                                    <h5 className="font-bold text-slate-700 border-b border-slate-100 pb-2">Informações Adicionais</h5>

                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">Vícios</p>
                                        <p className="text-slate-700">{selectedVolunteer.possuiVicios}</p>
                                        {selectedVolunteer.vicioDescricao && (
                                            <p className="text-sm text-slate-500 mt-1">{selectedVolunteer.vicioDescricao}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h5 className="font-bold text-slate-700 border-b border-slate-100 pb-2">Ministério e Treinamento</h5>

                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">Ministério de Interesse</p>
                                        <p className="text-indigo-600 font-bold">{selectedVolunteer.ministerioIdentificacao}</p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase">Disponível para Treinamento</p>
                                        <p className="text-slate-700">
                                            {selectedVolunteer.disponivelTreinamento ? 'Sim' : 'Não'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-3xl flex justify-end">
                            <button
                                onClick={() => setSelectedVolunteer(null)}
                                className="px-6 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-colors"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <nav className="flex bg-white rounded-xl shadow-sm border border-slate-100 mb-8 overflow-x-auto" aria-label="Navegação Administrativa">
                {(['DASHBOARD', 'LISTA', 'TREINAMENTO'] as AdminTab[]).map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        aria-current={tab === t ? 'page' : undefined}
                        className={`flex-1 min-w-[100px] py-4 font-bold text-xs transition-all focus:ring-inset focus:ring-2 focus:ring-indigo-500 outline-none uppercase tracking-widest ${tab === t ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        {t}
                    </button>
                ))}
                {/* Only ADMIN can see Configuration */}
                {userRole === 'ADMIN' && (
                    <button
                        onClick={() => setTab('CONFIGURACAO')}
                        aria-current={tab === 'CONFIGURACAO' ? 'page' : undefined}
                        className={`flex-1 min-w-[100px] py-4 font-bold text-xs transition-all focus:ring-inset focus:ring-2 focus:ring-indigo-500 outline-none uppercase tracking-widest ${tab === 'CONFIGURACAO' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        Configuração
                    </button>
                )}
            </nav>

            {tab === 'DASHBOARD' && (
                <>
                    <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8" aria-label="Indicadores principais">
                        {[
                            { label: 'Total Cadastros', val: stats.total, color: 'indigo', icon: 'fa-users' },
                            { label: 'Aptos / Aprovados', val: stats.aptos, color: 'green', icon: 'fa-check-double' },
                            { label: 'Integração', val: stats.integracao, color: 'amber', icon: 'fa-sync' },
                            { label: 'Escola Reino', val: stats.escola, color: 'red', icon: 'fa-book-open' }
                        ].map(s => (
                            <div key={s.label} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <div className={`w-10 h-10 bg-${s.color}-100 text-${s.color}-600 rounded-lg flex items-center justify-center mb-4`} aria-hidden="true">
                                    <i className={`fas ${s.icon}`}></i>
                                </div>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">{s.label}</p>
                                <h3 className="text-3xl font-black text-slate-800">{s.val}</h3>
                            </div>
                        ))}
                    </section>

                    <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <i className="fas fa-chart-pie text-indigo-500"></i> Distribuição de Status
                            </h4>
                            <div className="flex flex-col md:flex-row items-center justify-around gap-8">
                                <div className="relative w-40 h-40">
                                    <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                                        <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="3" />
                                        <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#6366f1" strokeWidth="3"
                                            strokeDasharray={`${stats.aptosPerc} ${100 - stats.aptosPerc}`}
                                            strokeDashoffset="0" />
                                        <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f59e0b" strokeWidth="3"
                                            strokeDasharray={`${stats.integracaoPerc} ${100 - stats.integracaoPerc}`}
                                            // Fix: Use an explicit binary operation (0 - x) to avoid unary minus ambiguity in JSX and satisfy TS arithmetic rules
                                            strokeDashoffset={0 - stats.aptosPerc} />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-2xl font-black text-slate-800">{stats.total}</span>
                                        <span className="text-[10px] text-slate-400 font-bold">TOTAL</span>
                                    </div>
                                </div>
                                <div className="space-y-3 w-full max-w-[200px]">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="flex items-center gap-2 font-bold text-slate-600"><span className="w-3 h-3 rounded-full bg-indigo-500"></span> Aptos</span>
                                        <span className="font-black">{Math.round(stats.aptosPerc)}%</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="flex items-center gap-2 font-bold text-slate-600"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Integração</span>
                                        <span className="font-black">{Math.round(stats.integracaoPerc)}%</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="flex items-center gap-2 font-bold text-slate-600"><span className="w-3 h-3 rounded-full bg-red-500"></span> Escola</span>
                                        <span className="font-black">{Math.round(stats.escolaPerc)}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <i className="fas fa-chart-bar text-indigo-500"></i> Preferência Ministerial
                            </h4>
                            <div className="space-y-4">
                                {Object.entries(stats.ministriesCount).map(([name, count]) => (
                                    <div key={name}>
                                        <div className="flex justify-between text-xs mb-1 font-bold text-slate-600">
                                            <span>{name}</span>
                                            <span>{count}</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500 transition-all duration-500"
                                                style={{ width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </>
            )}

            {tab === 'LISTA' && (
                <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden" aria-labelledby="volunteers-list-title">
                    <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                        <h3 id="volunteers-list-title" className="font-bold text-slate-800">Voluntários Cadastrados</h3>

                        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                            <div className="flex gap-2">
                                <button
                                    onClick={handleExportPDF}
                                    className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition-all border border-red-100"
                                    title="Baixar PDF"
                                >
                                    <i className="fas fa-file-pdf"></i> PDF
                                </button>
                                <button
                                    onClick={handleExportExcel}
                                    className="flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-600 hover:text-white transition-all border border-green-100"
                                    title="Baixar Excel"
                                >
                                    <i className="fas fa-file-excel"></i> XLS
                                </button>
                            </div>

                            <div className="relative w-full md:w-64">
                                <label htmlFor="filter-volunteers" className="sr-only">Filtrar voluntários</label>
                                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true"></i>
                                <input
                                    id="filter-volunteers"
                                    type="text"
                                    placeholder="Filtrar por nome ou status..."
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-bold">
                                <tr>
                                    <th className="p-4" scope="col">Voluntário</th>
                                    <th className="p-4" scope="col">Status</th>
                                    <th className="p-4" scope="col">Ministério</th>
                                    <th className="p-4 text-center" scope="col">Gestão</th>
                                    <th className="p-4 text-center" scope="col">Contato</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredVolunteers.map(v => (
                                    <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4">
                                            <p className="font-bold text-slate-800">{v.nomeCompleto}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{v.dataCadastro}</p>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${v.statusCadastro === 'Aprovado' || v.statusCadastro === 'Apto para Análise Final' ? 'bg-green-100 text-green-700' :
                                                v.statusCadastro === 'Reprovado' ? 'bg-red-100 text-red-700' :
                                                    v.statusCadastro?.includes('Pendente') ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                                                }`}>
                                                {v.statusCadastro}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-slate-600 font-medium truncate max-w-[150px]">{v.ministerioIdentificacao}</p>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex justify-center gap-1">
                                                <button
                                                    onClick={() => setSelectedVolunteer(v)}
                                                    className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center"
                                                    title="Ver Detalhes"
                                                >
                                                    <i className="fas fa-eye"></i>
                                                </button>
                                                <button
                                                    onClick={() => updateVolunteerStatus(v.id, 'Aprovado', 'Candidato aprovado pela coordenação ministerial.')}
                                                    disabled={v.statusCadastro === 'Aprovado'}
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${v.statusCadastro === 'Aprovado' ? 'bg-slate-50 text-slate-200' : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white'}`}
                                                    title="Aprovar Candidato"
                                                >
                                                    <i className="fas fa-check"></i>
                                                </button>
                                                <button
                                                    onClick={() => updateVolunteerStatus(v.id, 'Reprovado', 'Candidato reprovado após análise administrativa.')}
                                                    disabled={v.statusCadastro === 'Reprovado'}
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${v.statusCadastro === 'Reprovado' ? 'bg-slate-50 text-slate-200' : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white'}`}
                                                    title="Reprovar Candidato"
                                                >
                                                    <i className="fas fa-times"></i>
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        if (confirm('Tem certeza que deseja EXCLUIR este voluntário? Esta ação não pode ser desfeita.')) {
                                                            try {
                                                                await VolunteerService.deleteVolunteer(v.id);
                                                                setVolunteers(prev => prev.filter(vol => vol.id !== v.id));
                                                            } catch (error) {
                                                                alert('Erro ao excluir voluntário');
                                                            }
                                                        }
                                                    }}
                                                    className="w-8 h-8 rounded-lg bg-slate-50 text-slate-300 hover:bg-slate-600 hover:text-white transition-all flex items-center justify-center border border-slate-200"
                                                    title="Excluir Permanentemente"
                                                >
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <a
                                                href={getWhatsAppLink(v)}
                                                target="_blank"
                                                rel="noreferrer"
                                                aria-label={`Enviar WhatsApp para ${v.nomeCompleto}`}
                                                className="bg-green-100 text-green-600 p-2 rounded-lg hover:bg-green-600 hover:text-white transition-all inline-block focus:ring-2 focus:ring-green-500 outline-none"
                                                title="Enviar Feedback WhatsApp"
                                            >
                                                <i className="fab fa-whatsapp" aria-hidden="true"></i>
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {tab === 'TREINAMENTO' && (
                <section className="space-y-4" aria-labelledby="training-section-title">
                    <h3 id="training-section-title" className="sr-only">Acompanhamento de Treinamento</h3>
                    {training.map(t => (
                        <div key={t.volunteerId} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h4 className="font-bold text-slate-800">{t.nomeCompleto}</h4>
                                    <p className="text-xs text-slate-500">Início: {t.dataInicio}</p>
                                </div>
                                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">{t.status}</span>
                            </div>
                            <div className="grid grid-cols-5 gap-2" role="group" aria-label={`Progresso de aulas de ${t.nomeCompleto}`}>
                                {t.aulas.map((completed, i) => {
                                    const classNum = i + 1;
                                    return (
                                        <div key={i} className="text-center">
                                            <button
                                                onClick={async () => {
                                                    const newState = !completed;
                                                    // Optimistic UI update
                                                    setTraining(prev => prev.map(r => {
                                                        if (r.volunteerId === t.volunteerId) {
                                                            const newAulas = [...r.aulas];
                                                            newAulas[i] = newState;
                                                            return { ...r, aulas: newAulas };
                                                        }
                                                        return r;
                                                    }));

                                                    try {
                                                        await VolunteerService.updateTrainingAttendance(t.volunteerId, classNum, newState);
                                                    } catch (e) {
                                                        alert("Erro ao atualizar presença");
                                                        // Revert on error could be implemented here
                                                    }
                                                }}
                                                className={`w-full aspect-square rounded-xl border-2 flex items-center justify-center mb-1 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${completed
                                                    ? 'bg-green-500 border-green-600 text-white shadow-md hover:bg-green-600'
                                                    : 'bg-white border-slate-300 text-slate-300 hover:border-indigo-300 hover:text-indigo-300'
                                                    }`}
                                                title={`Aula ${classNum} - Clique para alterar`}
                                            >
                                                <i className={`fas ${completed ? 'fa-check' : 'fa-circle'}`} aria-hidden="true"></i>
                                            </button>
                                            <span className={`text-[10px] font-bold uppercase ${completed ? 'text-green-600' : 'text-slate-400'}`}>Aula {classNum}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </section>
            )}

            {tab === 'CONFIGURACAO' && (
                <div className="space-y-8 animate-fadeIn">
                    {/* Personalização */}
                    <ConfigurationSection />

                    {/* Configure Ministries */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                            <i className="fas fa-tags text-indigo-600"></i>
                            Áreas de Identificação (Ministérios)
                        </h3>
                        <p className="text-slate-500 text-sm mb-6">
                            Gerencie as opções de ministérios que aparecem no formulário de cadastro.
                        </p>

                        <div className="flex gap-2 mb-6">
                            <input
                                type="text"
                                placeholder="Nova área..."
                                className="flex-1 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                onKeyDown={async (e) => {
                                    if (e.key === 'Enter') {
                                        const val = e.currentTarget.value.trim();
                                        if (val) {
                                            await VolunteerService.addMinistry(val);
                                            e.currentTarget.value = '';
                                            const updated = await VolunteerService.getMinistries();
                                            setMinistries(updated);
                                        }
                                    }
                                }}
                            />
                            <button
                                className="bg-indigo-600 text-white px-4 rounded-xl hover:bg-indigo-700 transition-colors"
                                onClick={async (e) => {
                                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                    if (input.value.trim()) {
                                        await VolunteerService.addMinistry(input.value.trim());
                                        input.value = '';
                                        const updated = await VolunteerService.getMinistries();
                                        setMinistries(updated);
                                    }
                                }}
                            >
                                <i className="fas fa-plus"></i>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {ministries.map(min => (
                                <div key={min} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200 group hover:border-indigo-200 transition-colors">
                                    <span className="font-medium text-slate-700">{min}</span>
                                    <button
                                        onClick={async () => {
                                            if (confirm(`Remover "${min}"?`)) {
                                                await VolunteerService.removeMinistry(min);
                                                const updated = await VolunteerService.getMinistries();
                                                setMinistries(updated);
                                            }
                                        }}
                                        className="text-slate-400 hover:text-red-500 p-2 transition-colors"
                                    >
                                        <i className="fas fa-trash-alt"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                            <i className="fab fa-google-drive text-green-600"></i>
                            Integração Google Sheets
                        </h3>
                        <div className="flex items-center justify-between bg-green-50 p-4 rounded-xl border border-green-100">
                            <div>
                                <p className="font-bold text-green-800">{sheetsConfig.name}</p>
                                <p className="text-xs text-green-600 mt-1">Status: {sheetsConfig.status} • Última sincronização: {sheetsConfig.lastSync}</p>
                            </div>
                            <button className="bg-white text-green-600 border border-green-200 px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-50 transition-colors">
                                Reconfigurar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
