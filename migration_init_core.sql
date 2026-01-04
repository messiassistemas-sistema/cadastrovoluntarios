-- Create CHURCHES table
CREATE TABLE IF NOT EXISTS public.churches (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.churches ENABLE ROW LEVEL SECURITY;

-- Allow anon read/insert for churches (needed for setup)
CREATE POLICY "Allow anon select churches" ON public.churches FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert churches" ON public.churches FOR INSERT TO anon WITH CHECK (true);

-- Insert Default Church
INSERT INTO public.churches (name)
SELECT 'Sede'
WHERE NOT EXISTS (SELECT 1 FROM public.churches);

-- Create MEMBERS table
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

-- Enable RLS
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Policies are handled in migration_volunteers.sql but we can add basic ones here too
-- to be safe
CREATE POLICY "Allow anon select members" ON public.members FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert members" ON public.members FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update members" ON public.members FOR UPDATE TO anon USING (true);
