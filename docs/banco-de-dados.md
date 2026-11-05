# Banco de dados — dicionário de dados

Banco **`conexao_pais`** (MySQL 8 / MariaDB 10.6+, `utf8mb4`). Script de criação: [`database/schema.sql`](../database/schema.sql);
dados iniciais: [`database/seed.sql`](../database/seed.sql). Este documento foi gerado a partir da estrutura real do banco.

## `usuarios`

Contas do app e nível de acesso.

| Campo | Tipo | Nulo | Chave / padrão | Descrição |
| --- | --- | :---: | --- | --- |
| `id` | `int unsigned` | não | PK; auto incremento | Identificador (chave primária) |
| `nome` | `varchar(120)` | não |  | Nome de exibição |
| `email` | `varchar(160)` | não |  | E-mail de login (único) |
| `senha_hash` | `varchar(100)` | não |  | Senha criptografada com bcrypt (nunca a senha em texto) |
| `nivel` | `enum('usuario','profissional','admin')` | não | padrão `usuario` | Nível de acesso: usuario (família), profissional ou admin |
| `profissao` | `varchar(80)` | sim |  | Profissão (contas profissionais) |
| `registro_profissional` | `varchar(40)` | sim |  | Número do conselho de classe (CRP, CRM...) |
| `verificacao` | `enum('pendente','aprovado','ajustes_solicitados','recusado')` | não | padrão `aprovado` | Situação do cadastro profissional |
| `observacao_admin` | `varchar(500)` | sim |  | Orientação da administração ao pedir ajustes |
| `criado_em` | `timestamp` | não | padrão `CURRENT_TIMESTAMP` | Data de criação |
| `atualizado_em` | `timestamp` | não | padrão `CURRENT_TIMESTAMP` | Data da última alteração |

Valores únicos: `email`.

## `profissionais`

Perfil público do diretório de profissionais (pode estar ligado a uma conta).

| Campo | Tipo | Nulo | Chave / padrão | Descrição |
| --- | --- | :---: | --- | --- |
| `id` | `int unsigned` | não | PK; auto incremento | Identificador (chave primária) |
| `usuario_id` | `int unsigned` | sim | FK → `usuarios.id` (vira nulo) | Conta ligada ao perfil (opcional) |
| `slug` | `varchar(80)` | não |  | Identificador usado na URL/rota |
| `nome` | `varchar(120)` | não |  | Nome exibido |
| `especialidade` | `varchar(80)` | não |  | Área de atuação |
| `descricao` | `varchar(500)` | não |  | Apresentação curta |
| `cidade` | `varchar(80)` | sim |  | Cidade de atendimento |
| `atendimento` | `varchar(60)` | sim |  | Presencial, online... |
| `whatsapp` | `varchar(20)` | sim |  | Número para o botão de WhatsApp |
| `criado_em` | `timestamp` | não | padrão `CURRENT_TIMESTAMP` | Data de criação |

Valores únicos: `slug`, `usuario_id`.

## `publicacoes`

**Entidade principal.** Artigos publicados por profissionais aprovados e pela administração.

| Campo | Tipo | Nulo | Chave / padrão | Descrição |
| --- | --- | :---: | --- | --- |
| `id` | `int unsigned` | não | PK; auto incremento | Identificador (chave primária) |
| `autor_id` | `int unsigned` | não | FK → `usuarios.id` (apaga junto) | Autor do artigo |
| `tipo` | `enum('artigo','post')` | não | padrão `artigo` | Tipo de publicação (o app usa artigo) |
| `slug` | `varchar(180)` | não |  | Identificador único gerado a partir do título |
| `titulo` | `varchar(160)` | não |  | Título |
| `resumo` | `varchar(400)` | não |  | Resumo exibido nos cartões |
| `conteudo` | `text` | não |  | Texto (parágrafos separados por linha em branco) |
| `categoria` | `varchar(60)` | não |  | Categoria (Desenvolvimento, Gerações, Educação...) |
| `tags` | `varchar(255)` | sim |  | Etiquetas separadas por vírgula |
| `destaque` | `tinyint(1)` | não | padrão `0` | Aparece em destaque na tela Início |
| `status` | `enum('rascunho','publicado')` | não | padrão `publicado` | rascunho ou publicado |
| `criado_em` | `timestamp` | não | padrão `CURRENT_TIMESTAMP` | Data de criação |
| `atualizado_em` | `timestamp` | não | padrão `CURRENT_TIMESTAMP` | Data da última alteração |

Valores únicos: `slug`.

## `comentarios`

Comentários dos usuários nos artigos.

| Campo | Tipo | Nulo | Chave / padrão | Descrição |
| --- | --- | :---: | --- | --- |
| `id` | `int unsigned` | não | PK; auto incremento | Identificador (chave primária) |
| `publicacao_id` | `int unsigned` | não | FK → `publicacoes.id` (apaga junto) | Artigo comentado |
| `usuario_id` | `int unsigned` | não | FK → `usuarios.id` (apaga junto) | Quem comentou |
| `texto` | `varchar(1000)` | não |  | Texto do comentário |
| `criado_em` | `timestamp` | não | padrão `CURRENT_TIMESTAMP` | Data de criação |

## `interacoes`

Curtidas e conteúdos salvos (um registro por usuário, artigo e tipo).

| Campo | Tipo | Nulo | Chave / padrão | Descrição |
| --- | --- | :---: | --- | --- |
| `id` | `int unsigned` | não | PK; auto incremento | Identificador (chave primária) |
| `usuario_id` | `int unsigned` | não | FK → `usuarios.id` (apaga junto) | Quem curtiu/salvou |
| `publicacao_id` | `int unsigned` | não | FK → `publicacoes.id` (apaga junto) | Artigo |
| `tipo` | `enum('curtida','salvo')` | não |  | curtida ou salvo |
| `criado_em` | `timestamp` | não | padrão `CURRENT_TIMESTAMP` | Data de criação |

Valores únicos: `usuario_id + publicacao_id + tipo`.

## `colunas`

Colunas assinadas.

| Campo | Tipo | Nulo | Chave / padrão | Descrição |
| --- | --- | :---: | --- | --- |
| `id` | `int unsigned` | não | PK; auto incremento | Identificador (chave primária) |
| `colunista_id` | `int unsigned` | não | FK → `usuarios.id` (impede apagar) | Conta do colunista |
| `slug` | `varchar(80)` | não |  | Identificador usado na rota |
| `nome` | `varchar(100)` | não |  | Nome da coluna |
| `chamada` | `varchar(255)` | não |  | Frase de apresentação |
| `periodicidade` | `varchar(20)` | não |  | Semanal, Quinzenal, Mensal... |
| `sobre` | `text` | não |  | Descrição da coluna |
| `criado_em` | `timestamp` | não | padrão `CURRENT_TIMESTAMP` | Data de criação |

Valores únicos: `slug`.

## `coluna_posts`

Publicações de cada coluna.

| Campo | Tipo | Nulo | Chave / padrão | Descrição |
| --- | --- | :---: | --- | --- |
| `id` | `int unsigned` | não | PK; auto incremento | Identificador (chave primária) |
| `coluna_id` | `int unsigned` | não | FK → `colunas.id` (apaga junto) | Coluna |
| `slug` | `varchar(120)` | não |  | Identificador (único dentro da coluna) |
| `titulo` | `varchar(160)` | não |  | Título |
| `resumo` | `varchar(400)` | não |  | Resumo |
| `texto` | `text` | não |  | Texto (parágrafos separados por linha em branco) |
| `publicado_em` | `date` | não |  | Data de publicação |

Valores únicos: `coluna_id + slug`.

## `revistas`

Edições da revista digital.

| Campo | Tipo | Nulo | Chave / padrão | Descrição |
| --- | --- | :---: | --- | --- |
| `id` | `int unsigned` | não | PK; auto incremento | Identificador (chave primária) |
| `slug` | `varchar(40)` | não |  | Identificador usado na rota |
| `edicao` | `smallint unsigned` | não |  | Número da edição (único) |
| `titulo` | `varchar(160)` | não |  | Título da capa |
| `subtitulo` | `varchar(255)` | não |  | Subtítulo |
| `descricao` | `varchar(500)` | não |  | Descrição da edição |
| `categoria` | `varchar(60)` | não |  | Tema da edição |
| `destaques` | `text` | sim |  | Destaques da edição, um por linha |
| `pdf_url` | `varchar(255)` | sim |  | Link do PDF no site |
| `publicada_em` | `date` | não |  | Mês de publicação |

Valores únicos: `edicao`, `slug`.

## `revista_paginas`

Páginas de cada edição, lidas uma a uma no app.

| Campo | Tipo | Nulo | Chave / padrão | Descrição |
| --- | --- | :---: | --- | --- |
| `id` | `int unsigned` | não | PK; auto incremento | Identificador (chave primária) |
| `revista_id` | `int unsigned` | não | FK → `revistas.id` (apaga junto) | Edição |
| `numero` | `smallint unsigned` | não |  | Número da página |
| `secao` | `varchar(60)` | não |  | Seção (Capa, Reportagem...) |
| `titulo` | `varchar(160)` | não |  | Título da página |
| `texto` | `text` | não |  | Texto da página |

Valores únicos: `revista_id + numero`.

## `mensagens`

Mensagens do formulário de Contato e do "Pergunte à equipe".

| Campo | Tipo | Nulo | Chave / padrão | Descrição |
| --- | --- | :---: | --- | --- |
| `id` | `int unsigned` | não | PK; auto incremento | Identificador (chave primária) |
| `usuario_id` | `int unsigned` | sim | FK → `usuarios.id` (vira nulo) | Conta que enviou (opcional) |
| `tipo` | `enum('contato','pergunta')` | não |  | contato ou pergunta |
| `nome` | `varchar(120)` | não |  | Nome informado |
| `email` | `varchar(160)` | não |  | E-mail para resposta |
| `assunto` | `varchar(160)` | sim |  | Assunto (contato) |
| `mensagem` | `text` | não |  | Texto da mensagem |
| `status` | `enum('nova','respondida')` | não | padrão `nova` | nova ou respondida |
| `criado_em` | `timestamp` | não | padrão `CURRENT_TIMESTAMP` | Data de criação |
