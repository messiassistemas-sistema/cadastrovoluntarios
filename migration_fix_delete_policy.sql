-- POLICY: Allow anon delete volunteers
-- Enable deletion for anonymous users (application usage)
-- Force replacement of existing policy to ensure it is correct

-- 1. Drop the policy if it exists (to avoid "policy already exists" errors or incorrect old versions)
DROP POLICY IF EXISTS "Allow anon delete volunteers" ON public.volunteers;

-- 2. Create the policy explicitly
CREATE POLICY "Allow anon delete volunteers" ON public.volunteers FOR DELETE TO anon USING (true);
