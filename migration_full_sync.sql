-- SCRIPT DE SINCRONIZAÇÃO TOTAL DO BANCO DE DADOS
-- Execute este script no SQL Editor do Supabase para garantir que todas as tabelas e políticas existam na produção.

-- 1. Criação da Tabela CHURCHES (Dependência de Members)
CREATE TABLE IF NOT EXISTS public.churches (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.churches ENABLE ROW LEVEL SECURITY;

INSERT INTO public.churches (name)
SELECT 'Sede'
WHERE NOT EXISTS (SELECT 1 FROM public.churches);

-- 2. Criação da Tabela MEMBERS (Dependência de Volunteers)
CREATE TABLE IF NOT EXISTS public.members (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    church_id uuid REFERENCES public.churches(id),
    name text NOT NULL,
    phone text,
    birth_date date,
    marital_status text,
    type text DEFAULT 'VISITOR',
    status text DEFAULT 'ACTIVE',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- 3. Criação da Tabela VOLUNTEERS (Dependência de Training)
CREATE TABLE IF NOT EXISTS public.volunteers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id uuid REFERENCES public.members(id) ON DELETE CASCADE,
    ministerio_interesse text,
    disponibilidade_treinamento boolean DEFAULT false,
    aceita_principios boolean DEFAULT false,
    escola_reino boolean DEFAULT false,
    status_cadastro text DEFAULT 'Apto para Análise Final',
    observacoes_internas text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;

-- 4. Criação da Tabela APP_SETTINGS
CREATE TABLE IF NOT EXISTS public.app_settings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    registration_open boolean DEFAULT true,
    app_name text DEFAULT 'Portal MVP',
    org_name text DEFAULT 'Ministério Vida na Palavra',
    logo_url text,
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

INSERT INTO public.app_settings (registration_open, app_name, org_name)
SELECT true, 'Portal MVP', 'Ministério Vida na Palavra'
WHERE NOT EXISTS (SELECT 1 FROM public.app_settings);

-- 5. Criação da Tabela MINISTRIES (Áreas de Identificação)
CREATE TABLE IF NOT EXISTS public.ministries (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text UNIQUE NOT NULL,
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.ministries ENABLE ROW LEVEL SECURITY;

INSERT INTO public.ministries (name)
SELECT unnest(ARRAY[
    'Recepção', 'Kids', 'Mídia', 'Louvor', 'Intercessão', 
    'Manutenção', 'Ação Social', 'Teatro/Dança', 'Secretaria'
])
WHERE NOT EXISTS (SELECT 1 FROM public.ministries);

-- 6. Criação da Tabela TRAINING_PROGRESS
CREATE TABLE IF NOT EXISTS public.training_progress (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    volunteer_id uuid REFERENCES public.volunteers(id) ON DELETE CASCADE,
    class_number int NOT NULL,
    completed boolean DEFAULT false,
    completed_at timestamptz,
    updated_at timestamptz DEFAULT now(),
    UNIQUE(volunteer_id, class_number)
);

ALTER TABLE public.training_progress ENABLE ROW LEVEL SECURITY;

-- 7. POLÍTICAS DE SEGURANÇA (RLS)

-- --- MINISTRIES ---
DROP POLICY IF EXISTS "Allow anon select ministries" ON public.ministries;
CREATE POLICY "Allow anon select ministries" ON public.ministries FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Allow anon insert ministries" ON public.ministries;
CREATE POLICY "Allow anon insert ministries" ON public.ministries FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon delete ministries" ON public.ministries;
CREATE POLICY "Allow anon delete ministries" ON public.ministries FOR DELETE TO anon USING (true);

-- Authenticated access
DROP POLICY IF EXISTS "Allow authenticated select ministries" ON public.ministries;
CREATE POLICY "Allow authenticated select ministries" ON public.ministries FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert ministries" ON public.ministries;
CREATE POLICY "Allow authenticated insert ministries" ON public.ministries FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update ministries" ON public.ministries;
CREATE POLICY "Allow authenticated update ministries" ON public.ministries FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated delete ministries" ON public.ministries;
CREATE POLICY "Allow authenticated delete ministries" ON public.ministries FOR DELETE TO authenticated USING (true);

-- --- APP SETTINGS ---
DROP POLICY IF EXISTS "Allow anon select settings" ON public.app_settings;
CREATE POLICY "Allow anon select settings" ON public.app_settings FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Allow anon update settings" ON public.app_settings;
CREATE POLICY "Allow anon update settings" ON public.app_settings FOR UPDATE TO anon USING (true);

DROP POLICY IF EXISTS "Allow authenticated select settings" ON public.app_settings;
CREATE POLICY "Allow authenticated select settings" ON public.app_settings FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated update settings" ON public.app_settings;
CREATE POLICY "Allow authenticated update settings" ON public.app_settings FOR UPDATE TO authenticated USING (true);

-- --- TRAINING PROGRESS ---
DROP POLICY IF EXISTS "Allow anon select training" ON public.training_progress;
CREATE POLICY "Allow anon select training" ON public.training_progress FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Allow anon insert training" ON public.training_progress;
CREATE POLICY "Allow anon insert training" ON public.training_progress FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update training" ON public.training_progress;
CREATE POLICY "Allow anon update training" ON public.training_progress FOR UPDATE TO anon USING (true);

DROP POLICY IF EXISTS "Allow authenticated select training" ON public.training_progress;
CREATE POLICY "Allow authenticated select training" ON public.training_progress FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert training" ON public.training_progress;
CREATE POLICY "Allow authenticated insert training" ON public.training_progress FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update training" ON public.training_progress;
CREATE POLICY "Allow authenticated update training" ON public.training_progress FOR UPDATE TO authenticated USING (true);

-- --- VOLUNTEERS (Garantir que policies existam) ---
DROP POLICY IF EXISTS "Allow anon select volunteers" ON public.volunteers;
CREATE POLICY "Allow anon select volunteers" ON public.volunteers FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Allow anon insert volunteers" ON public.volunteers;
CREATE POLICY "Allow anon insert volunteers" ON public.volunteers FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update volunteers" ON public.volunteers;
CREATE POLICY "Allow anon update volunteers" ON public.volunteers FOR UPDATE TO anon USING (true);

DROP POLICY IF EXISTS "Allow authenticated select volunteers" ON public.volunteers;
CREATE POLICY "Allow authenticated select volunteers" ON public.volunteers FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert volunteers" ON public.volunteers;
CREATE POLICY "Allow authenticated insert volunteers" ON public.volunteers FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update volunteers" ON public.volunteers;
CREATE POLICY "Allow authenticated update volunteers" ON public.volunteers FOR UPDATE TO authenticated USING (true);

-- --- MEMBERS (Garantir acesso) ---
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anon select members') THEN
        CREATE POLICY "Allow anon select members" ON public.members FOR SELECT TO anon USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anon insert members') THEN
        CREATE POLICY "Allow anon insert members" ON public.members FOR INSERT TO anon WITH CHECK (true);
    END IF;
END $$;
