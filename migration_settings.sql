-- Create APP_SETTINGS table (Single Row Config)
CREATE TABLE IF NOT EXISTS public.app_settings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    registration_open boolean DEFAULT true,
    app_name text DEFAULT 'Portal MVP',
    org_name text DEFAULT 'Ministério Vida na Palavra',
    logo_url text, -- Base64 or URL
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Ensure one row exists
INSERT INTO public.app_settings (registration_open, app_name, org_name)
SELECT true, 'Portal MVP', 'Ministério Vida na Palavra'
WHERE NOT EXISTS (SELECT 1 FROM public.app_settings);

-- POLICIES
-- 1. Public Read
DROP POLICY IF EXISTS "Allow anon select settings" ON public.app_settings;
CREATE POLICY "Allow anon select settings" ON public.app_settings
    FOR SELECT TO anon USING (true);

-- 2. Public Update (For Admin Panel via Anon Client - effectively "Admin")
DROP POLICY IF EXISTS "Allow anon update settings" ON public.app_settings;
CREATE POLICY "Allow anon update settings" ON public.app_settings
    FOR UPDATE TO anon USING (true);
