-- =============================================================================
-- Supabase simulado — SOMENTE para os testes automatizados (npm test)
-- =============================================================================
-- O banco real do Conexão Pais fica no Supabase, que já vem com os esquemas "auth" e "storage"
-- e com os papéis anon, authenticated e service_role. Um PostgreSQL comum não tem nada disso,
-- então este arquivo cria uma versão mínima dessas peças. Depois dele, as migrations do site
-- (database/supabase/migrations) rodam sem alteração, e os testes usam a mesma estrutura do site.
-- NUNCA rode este arquivo no Supabase de verdade.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN CREATE ROLE anon NOLOGIN; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN CREATE ROLE authenticated NOLOGIN; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN CREATE ROLE service_role NOLOGIN; END IF;
END
$$;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -----------------------------------------------------------------------------
-- auth: contas (no Supabase, quem cuida desta tabela é o Supabase Auth)
-- -----------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE IF NOT EXISTS auth.users (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email              text UNIQUE,
  encrypted_password text,
  email_confirmed_at timestamptz DEFAULT now(),
  banned_until       timestamptz,
  last_sign_in_at    timestamptz,
  raw_user_meta_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

-- Quem está fazendo a requisição. No Supabase vem do token; aqui, da configuração
-- "request.jwt.claims" da transação (a API preenche quando uma função do banco precisa saber).
CREATE OR REPLACE FUNCTION auth.jwt() RETURNS jsonb
LANGUAGE sql STABLE AS $$
  SELECT coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb
$$;

CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid
LANGUAGE sql STABLE AS $$
  SELECT nullif(auth.jwt() ->> 'sub', '')::uuid
$$;

-- -----------------------------------------------------------------------------
-- storage: arquivos (avatares e PDFs da revista). Só o necessário para as políticas do site.
-- -----------------------------------------------------------------------------
CREATE SCHEMA IF NOT EXISTS storage;

CREATE TABLE IF NOT EXISTS storage.objects (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_id text,
  name      text
);
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION storage.foldername(name text) RETURNS text[]
LANGUAGE sql IMMUTABLE AS $$
  SELECT (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1]
$$;
