-- Create MINISTRIES table
CREATE TABLE IF NOT EXISTS public.ministries (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text UNIQUE NOT NULL,
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ministries ENABLE ROW LEVEL SECURITY;

-- POPULATE with defaults (only if empty)
INSERT INTO public.ministries (name)
SELECT unnest(ARRAY[
    'Recepção', 'Kids', 'Mídia', 'Louvor', 'Intercessão', 
    'Manutenção', 'Ação Social', 'Teatro/Dança', 'Secretaria'
])
WHERE NOT EXISTS (SELECT 1 FROM public.ministries);

-- POLICIES
-- 1. Anonymous Select
DROP POLICY IF EXISTS "Allow anon select ministries" ON public.ministries;
CREATE POLICY "Allow anon select ministries" ON public.ministries
    FOR SELECT TO anon USING (true);

-- 2. Anonymous Insert (Admin Panel uses Anon Client for now)
DROP POLICY IF EXISTS "Allow anon insert ministries" ON public.ministries;
CREATE POLICY "Allow anon insert ministries" ON public.ministries
    FOR INSERT TO anon WITH CHECK (true);

-- 3. Anonymous Delete
DROP POLICY IF EXISTS "Allow anon delete ministries" ON public.ministries;
CREATE POLICY "Allow anon delete ministries" ON public.ministries
    FOR DELETE TO anon USING (true);
