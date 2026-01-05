-- FIX: Allow DELETE for BOTH Anonymous and Authenticated users
-- This ensures deletion works regardless of login state.

-- 1. ANONYMOUS USERS (Public/Unauthenticated)
DROP POLICY IF EXISTS "Allow anon delete volunteers" ON public.volunteers;
CREATE POLICY "Allow anon delete volunteers" ON public.volunteers FOR DELETE TO anon USING (true);

-- 2. AUTHENTICATED USERS (Logged in)
DROP POLICY IF EXISTS "Allow authenticated delete volunteers" ON public.volunteers;
CREATE POLICY "Allow authenticated delete volunteers" ON public.volunteers FOR DELETE TO authenticated USING (true);

-- 3. Verify Grants (Ensure the Roles have table level DELETE permission)
GRANT DELETE ON public.volunteers TO anon;
GRANT DELETE ON public.volunteers TO authenticated;
GRANT DELETE ON public.volunteers TO service_role;
