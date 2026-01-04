-- FIX: Correção de Permissões na tabela MEMBERS
-- Garante que o formulário público consiga criar novos membros (visitantes).

-- 1. Liberar INSERÇÃO e LEITURA para Anon (Público)
DROP POLICY IF EXISTS "Allow anon insert members" ON public.members;
CREATE POLICY "Allow anon insert members" ON public.members FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon select members" ON public.members;
CREATE POLICY "Allow anon select members" ON public.members FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Allow anon update members" ON public.members;
CREATE POLICY "Allow anon update members" ON public.members FOR UPDATE TO anon USING (true);

-- 2. Liberar acesso para Authenticated (Usuários logados)
DROP POLICY IF EXISTS "Allow authenticated insert members" ON public.members;
CREATE POLICY "Allow authenticated insert members" ON public.members FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated select members" ON public.members;
CREATE POLICY "Allow authenticated select members" ON public.members FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated update members" ON public.members;
CREATE POLICY "Allow authenticated update members" ON public.members FOR UPDATE TO authenticated USING (true);
