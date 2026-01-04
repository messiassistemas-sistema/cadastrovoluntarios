-- Create Training Progress Table
CREATE TABLE IF NOT EXISTS public.training_progress (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    volunteer_id uuid REFERENCES public.volunteers(id) ON DELETE CASCADE,
    class_number int NOT NULL, -- 1, 2, 3...
    completed boolean DEFAULT false,
    completed_at timestamptz,
    updated_at timestamptz DEFAULT now(),
    UNIQUE(volunteer_id, class_number)
);

-- Enable RLS
ALTER TABLE public.training_progress ENABLE ROW LEVEL SECURITY;

-- POLICIES
-- 1. Public Read (Anon) - needed for Admin Panel via Anon Client (simulated admin)
DROP POLICY IF EXISTS "Allow anon select training" ON public.training_progress;
CREATE POLICY "Allow anon select training" ON public.training_progress
    FOR SELECT TO anon USING (true);

-- 2. Public Update/Insert (Anon) - needed for Admin Panel toggles
DROP POLICY IF EXISTS "Allow anon insert training" ON public.training_progress;
CREATE POLICY "Allow anon insert training" ON public.training_progress
    FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update training" ON public.training_progress;
CREATE POLICY "Allow anon update training" ON public.training_progress
    FOR UPDATE TO anon USING (true);
