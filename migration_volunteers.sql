-- Create VOLUNTEERS table if it doesn't exist
-- This table links to the main MEMBERS table (corrected from PROFILES)
-- We DROP first to ensure schema correction if previous script ran
DROP TABLE IF EXISTS public.volunteers CASCADE;

CREATE TABLE IF NOT EXISTS public.volunteers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Link to the existing Member
    member_id uuid REFERENCES public.members(id) ON DELETE CASCADE,
    
    -- Volunteer specific data
    ministerio_interesse text,
    disponibilidade_treinamento boolean DEFAULT false,
    aceita_principios boolean DEFAULT false,
    escola_reino boolean DEFAULT false,
    
    -- Admin Status
    status_cadastro text DEFAULT 'Apto para Análise Final', -- 'Encaminhado', 'Aprovado', 'Reprovado', etc.
    observacoes_internas text,
    
    -- Technical
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- IDEMPOTENT POLICY CREATION
-- -----------------------------------------------------------------------------

-- 1. Volunteer Insert
DROP POLICY IF EXISTS "Allow anon insert volunteers" ON public.volunteers;
CREATE POLICY "Allow anon insert volunteers" ON public.volunteers
    FOR INSERT 
    TO anon
    WITH CHECK (true);

-- 2. Volunteer Select
DROP POLICY IF EXISTS "Allow anon select volunteers" ON public.volunteers;
CREATE POLICY "Allow anon select volunteers" ON public.volunteers
    FOR SELECT
    TO anon
    USING (true);

-- 3. Volunteer Update
DROP POLICY IF EXISTS "Allow anon update volunteers" ON public.volunteers;
CREATE POLICY "Allow anon update volunteers" ON public.volunteers
    FOR UPDATE
    TO anon
    USING (true);

-- 4. Member Insert (For New Visitors)
-- Ensure 'members' table allows anon insert for creating new visitor profiles from form
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'members'
        AND policyname = 'Allow anon insert members'
    ) THEN
        CREATE POLICY "Allow anon insert members" ON public.members FOR INSERT TO anon WITH CHECK (true);
    END IF;
END
$$;

-- 5. Member Select (For duplication check)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'members'
        AND policyname = 'Allow anon select members'
    ) THEN
        CREATE POLICY "Allow anon select members" ON public.members FOR SELECT TO anon USING (true);
    END IF;
END
$$;
