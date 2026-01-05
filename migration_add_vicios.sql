-- Add columns for storing addiction information
ALTER TABLE public.volunteers ADD COLUMN IF NOT EXISTS has_addiction text DEFAULT 'Não';
ALTER TABLE public.volunteers ADD COLUMN IF NOT EXISTS addiction_details text;
