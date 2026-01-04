-- FIX: Adiciona permissões de leitura na tabela CHURCHES
-- O erro "Nenhuma igreja encontrada" acontece porque o RLS estava ativado mas sem políticas de acesso.

-- 1. Permitir leitura (SELECT) para todos (Anon)
DROP POLICY IF EXISTS "Allow anon select churches" ON public.churches;
CREATE POLICY "Allow anon select churches" ON public.churches FOR SELECT TO anon USING (true);

-- 2. Permitir leitura para usuários logados (Authenticated)
DROP POLICY IF EXISTS "Allow authenticated select churches" ON public.churches;
CREATE POLICY "Allow authenticated select churches" ON public.churches FOR SELECT TO authenticated USING (true);

-- 3. Garantir que exita pelo menos uma igreja
INSERT INTO public.churches (name)
SELECT 'Sede'
WHERE NOT EXISTS (SELECT 1 FROM public.churches);
