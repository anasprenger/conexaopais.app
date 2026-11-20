# Banco de dados

O app usa o **banco do site Conexão Pais** (PostgreSQL no Supabase). Nada aqui precisa ser executado para rodar o app:
o banco já existe no Supabase.

- `supabase/migrations/`: estrutura do banco (tabelas, gatilhos, funções e regras de acesso). É uma **cópia** das
  migrations do repositório do site (`anasprenger/conexaopais`, pastas `supabase/migrations` e `drizzle/migrations`),
  feita em 16/11/2026. A fonte oficial é o repositório do site: se ele ganhar migrations novas, copie para cá.
- `teste/`: usado **somente** pelos testes automatizados da API (`npm test`), num banco temporário em memória.
  - `supabase-simulado.sql`: as peças do Supabase que um PostgreSQL comum não tem;
  - `dados-teste.sql`: contas de teste (senha `123456`, só no banco temporário).

**Nunca rode os arquivos de `teste/` no Supabase de verdade.** O dicionário de dados está em
[`docs/banco-de-dados.md`](../docs/banco-de-dados.md).
