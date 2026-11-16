# Banco de dados — dicionário de dados

O app usa o **banco do site Conexão Pais**: PostgreSQL no Supabase (projeto `conexao-pais`). A estrutura é criada
pelas migrations do site, copiadas em [`database/supabase/migrations/`](../database/supabase/migrations). Este
documento foi gerado a partir da estrutura real (as migrations aplicadas num PostgreSQL), e as colunas conferem com o
banco do Supabase.

Todos os ids são **UUID** (gerados pelo banco). Datas são `timestamptz` (com fuso horário).

## `auth.users` (Supabase Auth)

Contas de login, cuidadas pelo **Supabase Auth**: a API só lê esta tabela (o cadastro e a conferência da senha passam
pelo serviço de contas do Supabase). Campos que a API usa:

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | `uuid` | Identificador da conta, usado em todas as outras tabelas (e no `sub` do JWT da API) |
| `email` | `text` | E-mail de login (único) |
| `encrypted_password` | `text` | **Hash bcrypt** da senha (nunca a senha em texto). A API nunca devolve este campo |
| `email_confirmed_at` | `timestamptz` | Quando o e-mail foi confirmado (sem confirmação, o login é recusado) |
| `banned_until` | `timestamptz` | Suspensão da conta pela administração |
| `raw_user_meta_data` | `jsonb` | Dados enviados no cadastro (nome, tipo de conta, profissão, registro), usados pelo gatilho `handle_new_user` |
| `created_at` | `timestamptz` | Data do cadastro |


## `profiles`

Perfil de cada conta (um por conta, criado pelo gatilho `handle_new_user` no cadastro).

| Campo | Tipo | Nulo | Chave / padrão | Descrição |
| --- | --- | :---: | --- | --- |
| `id` | `uuid` | não | FK → auth.users; PK | Mesmo id da conta em `auth.users` |
| `display_name` | `text` | sim |  | Nome de exibição |
| `bio` | `text` | sim |  | Apresentação (usada pelo site) |
| `avatar_url` | `text` | sim |  | Foto (caminho no Storage ou link) |
| `status` | `text` | não | padrão `'ativo'` | `ativo` ou suspenso pela administração; conta não ativa perde o acesso na API |
| `created_at` | `timestamptz` | não | padrão `now()` | Data de criação |
| `updated_at` | `timestamptz` | não | padrão `now()` | Data da última alteração |
| `whatsapp` | `text` | sim |  | WhatsApp (profissionais) |
| `especialidade` | `text` | sim |  | Especialidade (profissionais) |
| `profissao` | `text` | sim |  | Profissão informada no cadastro profissional |
| `registro_profissional` | `text` | sim |  | Número no conselho de classe (CRP, CRM...) |
| `verificacao` | `text` | não | padrão `'pendente'` | Situação do cadastro profissional: `pendente`, `aprovado` ou `recusado`. Só admin altera (gatilho `protect_profile_verification_fields`) |
| `verificado_em` | `timestamptz` | sim |  | Quando a administração decidiu |
| `verificado_por` | `uuid` | sim |  | Quem decidiu (id do admin) |
| `welcome_email_sent_at` | `timestamptz` | sim |  | Quando o site enviou o e-mail de boas-vindas |

## `user_roles`

Papéis (níveis) de cada conta. Uma conta pode ter mais de um; a API considera o mais alto: admin > profissional > usuario.

Chave única composta: (`user_id`, `role`).

| Campo | Tipo | Nulo | Chave / padrão | Descrição |
| --- | --- | :---: | --- | --- |
| `id` | `uuid` | não | PK; padrão `gen_random_uuid()` | Identificador |
| `user_id` | `uuid` | não | FK → auth.users | Conta |
| `role` | `app_role` | não | | `usuario` (família), `profissional` ou `admin` |
| `created_at` | `timestamptz` | não | padrão `now()` | Data de criação |

## `publicacoes`

**Entidade principal.** Publicações do site e do app. O app faz o CRUD do tipo `artigo` e lista `artigo` e `post`; colunas e revistas vêm do site.

| Campo | Tipo | Nulo | Chave / padrão | Descrição |
| --- | --- | :---: | --- | --- |
| `id` | `uuid` | não | PK; padrão `gen_random_uuid()` | Identificador |
| `tipo` | `tipo_publicacao` | não |  | `artigo`, `post`, `revista` ou `coluna` |
| `slug` | `text` | não | único | Endereço da publicação (ex.: `rotina-de-sono-mtacjwbo`); identifica o artigo no app e liga curtidas e comentários |
| `titulo` | `text` | não |  | Título |
| `resumo` | `text` | sim |  | Resumo |
| `conteudo` | `text` | sim |  | Texto, com parágrafos separados por uma linha em branco |
| `categoria` | `text` | sim |  | Categoria (ex.: Educação) |
| `capa_url` | `text` | sim |  | Imagem de capa (usada pelo site) |
| `pdf_url` | `text` | sim |  | PDF da edição da revista (caminho no Storage, arquivo do site ou link) |
| `autor_id` | `uuid` | não | FK → auth.users | Quem publicou (vem do token na API) |
| `status` | `status_publicacao` | não | padrão `'publicado'` | `rascunho` ou `publicado` (o app só mostra publicadas) |
| `created_at` | `timestamptz` | não | padrão `now()` | Data de publicação |
| `updated_at` | `timestamptz` | não | padrão `now()` | Data da última alteração |

## `comentarios`

Comentários nas publicações (inclusive nos artigos de exemplo do site, por isso a ligação é pelo slug).

| Campo | Tipo | Nulo | Chave / padrão | Descrição |
| --- | --- | :---: | --- | --- |
| `id` | `uuid` | não | PK; padrão `gen_random_uuid()` | Identificador |
| `user_id` | `uuid` | não | FK → auth.users | Quem comentou (vem do token na API) |
| `publicacao_slug` | `text` | não |  | Slug da publicação comentada |
| `texto` | `text` | não |  | Comentário (3 a 1000 caracteres na API) |
| `created_at` | `timestamptz` | não | padrão `now()` | Data |
| `updated_at` | `timestamptz` | não | padrão `now()` | Data da última alteração |

## `interacoes`

Curtidas, conteúdos salvos e leituras. Chave única (conta + slug + tipo): ninguém curte ou salva duas vezes.

Chave única composta: (`user_id`, `publicacao_slug`, `tipo`).

| Campo | Tipo | Nulo | Chave / padrão | Descrição |
| --- | --- | :---: | --- | --- |
| `id` | `uuid` | não | PK; padrão `gen_random_uuid()` | Identificador |
| `user_id` | `uuid` | não | FK → auth.users | Conta |
| `publicacao_slug` | `text` | não | | Slug da publicação |
| `tipo` | `tipo_interacao` | não | | `curtida`, `salvo` ou `lido` (o app usa curtida e salvo) |
| `created_at` | `timestamptz` | não | padrão `now()` | Data |

## `comentario_curtidas`

Curtidas em comentários (recurso do site; o app ainda não usa).

Chave única composta: (`comentario_id`, `user_id`).

| Campo | Tipo | Nulo | Chave / padrão | Descrição |
| --- | --- | :---: | --- | --- |
| `id` | `uuid` | não | PK; padrão `gen_random_uuid()` | Identificador |
| `comentario_id` | `uuid` | não | FK → public.comentarios | Comentário curtido |
| `user_id` | `uuid` | não | FK → auth.users | Quem curtiu |
| `created_at` | `timestamptz` | não | padrão `now()` | Data |

## `contact_messages`

Mensagens de Contato do site e do app (no app também a "Pergunte à equipe", com o assunto "Pergunta à equipe"). Gravadas pela função `submit_contact_message`.

| Campo | Tipo | Nulo | Chave / padrão | Descrição |
| --- | --- | :---: | --- | --- |
| `id` | `uuid` | não | PK; padrão `gen_random_uuid()` | Identificador |
| `name` | `text` | não |  | Nome |
| `email` | `text` | não |  | E-mail para resposta |
| `subject` | `text` | sim |  | Assunto |
| `message` | `text` | não |  | Mensagem (10 a 5000 caracteres) |
| `status` | `text` | não | padrão `'novo'` | Situação (`novo`...) controlada pela administração no site |
| `created_at` | `timestamptz` | não | padrão `now()` | Data |

## `conteudos_ocultos`

Conteúdos de exemplo do site escondidos pela administração (no site ou no app).

Chave única composta: (`tipo`, `slug`).

| Campo | Tipo | Nulo | Chave / padrão | Descrição |
| --- | --- | :---: | --- | --- |
| `id` | `uuid` | não | PK; padrão `gen_random_uuid()` | Identificador |
| `tipo` | `text` | não | | `artigo`, `coluna` ou `revista` |
| `slug` | `text` | não | | Slug do conteúdo escondido |
| `titulo` | `text` | não |  | Título (para a administração) |
| `justificativa` | `text` | sim |  | Motivo |
| `ocultado_por` | `uuid` | não | FK → auth.users | Admin que escondeu |
| `created_at` | `timestamptz` | não | padrão `now()` | Data |

## `remocoes_publicacao`

Aviso ao autor quando a administração remove a publicação dele. O site mostra em "Minha conta".

| Campo | Tipo | Nulo | Chave / padrão | Descrição |
| --- | --- | :---: | --- | --- |
| `id` | `uuid` | não | PK; padrão `gen_random_uuid()` | Identificador |
| `publicacao_id` | `uuid` | não |  | Id da publicação removida |
| `titulo` | `text` | não |  | Título |
| `tipo` | `text` | não |  | Tipo |
| `slug` | `text` | não |  | Slug |
| `autor_id` | `uuid` | não | FK → auth.users | Autor que recebe o aviso |
| `removido_por` | `uuid` | não | FK → auth.users | Admin que removeu |
| `justificativa` | `text` | não |  | Motivo |
| `created_at` | `timestamptz` | não | padrão `now()` | Data |

## `solicitacoes_profissional`

Pedidos de verificação feitos pela página "Seja profissional" do site (o app usa o cadastro com profissão e registro, que fica em `profiles`).

| Campo | Tipo | Nulo | Chave / padrão | Descrição |
| --- | --- | :---: | --- | --- |
| `id` | `uuid` | não | PK; padrão `gen_random_uuid()` | Identificador |
| `user_id` | `uuid` | não | FK → auth.users | Conta |
| `nome_completo` | `text` | não |  | Nome completo |
| `telefone` | `text` | não |  | Telefone |
| `email` | `text` | não |  | E-mail |
| `profissao` | `text` | não |  | Profissão |
| `registro_profissional` | `text` | não |  | Registro |
| `endereco` | `text` | não |  | Endereço |
| `rede_social` | `text` | sim |  | Rede social |
| `foto_url` | `text` | sim |  | Foto |
| `status` | `text` | não | padrão `'pendente'` | Situação do pedido |
| `observacao_admin` | `text` | sim |  | Orientação da administração |
| `created_at` | `timestamptz` | não | padrão `now()` | Data |
| `updated_at` | `timestamptz` | não | padrão `now()` | Data da última alteração |

## Funções e gatilhos do site usados pela API

| Nome | Tipo | O que faz |
| --- | --- | --- |
| `handle_new_user` | gatilho em `auth.users` | No cadastro, cria o perfil e o papel (`usuario` ou `profissional` pendente) a partir dos dados enviados |
| `protect_profile_verification_fields` | gatilho em `profiles` | Só admin muda `verificacao`, `verificado_em` e `verificado_por`. A API informa quem está agindo (`comoUsuario`) |
| `submit_contact_message` | função | Valida e grava a mensagem de contato; limita 3 mensagens por hora por e-mail |
| `update_updated_at_column` | gatilho | Atualiza `updated_at` nas alterações |

## Regras de acesso

O site acessa o banco com as políticas de segurança do Supabase (RLS). A API conecta como dona do banco, então essas
políticas não valem para ela: quem aplica as mesmas regras na API são os middlewares `autenticacao.js` e
`permissoes.js` (README, seção 3.5). As credenciais do banco ficam só no `api/.env`, fora do Git.
