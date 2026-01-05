-- Adiciona colunas para armazenar informações sobre vícios
ALTER TABLE public.volunteers ADD COLUMN IF NOT EXISTS possui_vicios text DEFAULT 'Não';
ALTER TABLE public.volunteers ADD COLUMN IF NOT EXISTS descricao_vicio text;
