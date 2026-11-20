-- =============================================================================
-- Contas usadas SOMENTE nos testes automatizados (banco em memória, apagado no fim de cada teste)
-- Senha de todas: 123456 (guardada como hash bcrypt, como faz o Supabase Auth)
-- NUNCA rode este arquivo no Supabase de verdade.
-- =============================================================================

-- O gatilho handle_new_user (migration do site) cria o perfil e o nível de cada conta
INSERT INTO auth.users (id, email, encrypted_password, raw_user_meta_data) VALUES
  ('00000000-0000-4000-8000-000000000001', 'admin@conexaopais.test',        crypt('123456', gen_salt('bf', 10)),
   '{"display_name": "Ana (Administração)"}'),
  ('00000000-0000-4000-8000-000000000002', 'profissional@conexaopais.test', crypt('123456', gen_salt('bf', 10)),
   '{"display_name": "Dra. Helena Prado", "tipo_conta": "profissional", "profissao": "Psicóloga", "registro_profissional": "CRP 07/12345"}'),
  ('00000000-0000-4000-8000-000000000003', 'familia@conexaopais.test',      crypt('123456', gen_salt('bf', 10)),
   '{"display_name": "Família Souza"}'),
  ('00000000-0000-4000-8000-000000000004', 'pendente@conexaopais.test',     crypt('123456', gen_salt('bf', 10)),
   '{"display_name": "Profissional Pendente", "tipo_conta": "profissional", "profissao": "Pedagoga", "registro_profissional": "REG 4321"}');

-- Admin: papel extra de administração (como no banco do site)
INSERT INTO public.user_roles (user_id, role) VALUES ('00000000-0000-4000-8000-000000000001', 'admin');

-- A profissional de demonstração já foi aprovada pela administração.
-- O gatilho protect_profile_verification_fields só aceita essa mudança feita por um admin.
SELECT set_config('request.jwt.claims', '{"sub": "00000000-0000-4000-8000-000000000001"}', false);
UPDATE public.profiles SET verificacao = 'aprovado', verificado_em = now()
 WHERE id = '00000000-0000-4000-8000-000000000002';
