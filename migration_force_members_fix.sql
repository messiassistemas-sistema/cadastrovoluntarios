-- FORCE FIX: Resetar TODAS as políticas da tabela MEMBERS
-- Esse script apaga qualquer regra antiga e cria novas "limpas" para garantir o funcionamento.

-- 1. Habilitar RLS (caso não esteja)
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- 2. APAGAR políticas antigas (para não dar conflito)
DROP POLICY IF EXISTS "Allow anon insert members" ON public.members;
DROP POLICY IF EXISTS "Allow anon select members" ON public.members;
DROP POLICY IF EXISTS "Allow anon update members" ON public.members;
DROP POLICY IF EXISTS "Allow authenticated insert members" ON public.members;
DROP POLICY IF EXISTS "Allow authenticated select members" ON public.members;
DROP POLICY IF EXISTS "Allow authenticated update members" ON public.members;
-- Apagar também nomes genéricos que o Supabase possa ter criado
DROP POLICY IF EXISTS "Enable read access for all users" ON public.members;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.members;

-- 3. CRIAR NOVAS POLÍTICAS (Permissivas)
-- Leitura (SELECT): Todo mundo pode ler
CREATE POLICY "Members Select All" ON public.members 
FOR SELECT USING (true);

-- Inserção (INSERT): Todo mundo pode criar
CREATE POLICY "Members Insert All" ON public.members 
FOR INSERT WITH CHECK (true);

-- Atualização (UPDATE): Todo mundo pode atualizar
CREATE POLICY "Members Update All" ON public.members 
FOR UPDATE USING (true);
