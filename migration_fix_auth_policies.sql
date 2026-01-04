-- FIX RLS POLICIES FOR AUTHENTICATED USERS
-- Previous policies were only for 'anon'. attempting to use the app as logged in user results in empty data.

-- CHURCHES
CREATE POLICY "Allow authenticated select churches" ON public.churches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert churches" ON public.churches FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update churches" ON public.churches FOR UPDATE TO authenticated USING (true);

-- MEMBERS
CREATE POLICY "Allow authenticated select members" ON public.members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert members" ON public.members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update members" ON public.members FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete members" ON public.members FOR DELETE TO authenticated USING (true);

-- VOLUNTEERS
CREATE POLICY "Allow authenticated select volunteers" ON public.volunteers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert volunteers" ON public.volunteers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update volunteers" ON public.volunteers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete volunteers" ON public.volunteers FOR DELETE TO authenticated USING (true);

-- MINISTRIES
CREATE POLICY "Allow authenticated select ministries" ON public.ministries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert ministries" ON public.ministries FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update ministries" ON public.ministries FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete ministries" ON public.ministries FOR DELETE TO authenticated USING (true);

-- TRAINING PROGRESS
CREATE POLICY "Allow authenticated select training" ON public.training_progress FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert training" ON public.training_progress FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update training" ON public.training_progress FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete training" ON public.training_progress FOR DELETE TO authenticated USING (true);

-- APP SETTINGS
CREATE POLICY "Allow authenticated select settings" ON public.app_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated update settings" ON public.app_settings FOR UPDATE TO authenticated USING (true);
