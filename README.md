# Conexão Pais — App

> **Ajudando a unir famílias e gerações.**

Versão mobile do portal **Conexão Pais** ([conexaopais.com.br](https://conexaopais.com.br)): artigos, colunas, revista
digital, profissionais parceiros e comunidade para quem cuida, educa e acompanha crianças e adolescentes.

Projeto avaliativo da disciplina de Aplicações Mobile (React Native + API REST + MySQL + JWT), desenvolvido em
4 entregas incrementais.

| Entrega | Conteúdo | Situação |
| --- | --- | --- |
| **1** | Problema, proposta, projeto Expo, telas, navegação e repositório | ✅ Entregue |
| **2** | Modelagem, MySQL, API Express, integração com `fetch()` | ✅ Entregue |
| **3** | JWT, Bearer Token, middleware, níveis no back-end, rotas protegidas e logout | ✅ Concluída |
| 4 | Testes, correções, README final, APK e apresentação | ⏳ Próxima etapa |

---

## 1. Proposta do projeto (Entrega 1)

### 1.1 Problema atual identificado

Quem cuida de crianças e adolescentes tem dúvidas todos os dias: desenvolvimento, sono, escola, telas, limites,
convivência com os avós. Informação existe de sobra, mas está **espalhada, nem sempre é confiável** e muitas vezes
vem cheia de jargão ou de julgamento. Na prática, quem cuida costuma **se sentir sozinho ao decidir**.

> *"Cuidar dá trabalho. Encontrar boa informação não deveria dar."*

> **Pergunta orientadora:** como uma aplicação mobile pode reunir informação confiável, acolhimento e contato com
> profissionais em um só lugar para quem cuida?

### 1.2 Contexto e público afetado

- **Público principal:** pais, mães, avós e outros responsáveis, em todas as configurações de família.
- **Profissionais parceiros:** psicólogos, pediatras, pedagogos, terapeutas familiares e outras pessoas que
  atendem famílias e querem publicar conteúdo de qualidade.
- **Afetados indiretamente:** crianças e adolescentes, que ganham adultos mais bem informados e mais tranquilos
  para conversar.

O projeto já existe como portal web (site Conexão Pais). O app leva esse ecossistema para o celular, que é onde a
dúvida aparece: no carro, na fila da escola, na hora de dormir.

### 1.3 Justificativa

- **Credibilidade:** o conteúdo é escrito e revisado por profissionais, com autoria visível.
- **Acolhimento:** linguagem clara, sem jargão e sem julgamento, pensada para diferentes arranjos familiares.
- **Rede de apoio:** a comunidade (curtir, salvar, comentar, perguntar à equipe) e o diretório de profissionais
  verificados mostram que ninguém precisa cuidar sozinho.
- **Segurança:** só profissionais com registro conferido pela administração podem publicar.
- **Por que um app:** consulta rápida no momento da dúvida, conteúdos salvos sempre à mão e, futuramente, avisos
  de novas colunas e edições da revista.
- **ODS 4 (Educação de Qualidade):** educação não formal e aprendizagem ao longo da vida para famílias.

### 1.4 Proposta de solução

O **app Conexão Pais** reúne, no celular, as seções do portal:

1. **Conteúdos:** artigos, colunas assinadas e a revista digital (leitura página a página).
2. **Profissionais:** diretório com especialidade, cidade, forma de atendimento e contato por WhatsApp.
3. **Comunidade:** curtidas, conteúdos salvos, comentários nos artigos, perguntas à equipe e regras de convivência.
4. **Área de publicação:** profissionais aprovados e a administração publicam, editam e excluem artigos.
5. **Administração:** verificação de novos profissionais (aprovar, pedir ajustes ou recusar) e moderação.

A **entidade principal** é a **Publicação (artigo)**. É ela que terá CRUD completo integrado à API e ao MySQL nas
próximas entregas, assim como a tabela `publicacoes` do site.

**Arquitetura da solução** (construída ao longo das 4 entregas):

```mermaid
flowchart LR
    APP["App React Native (Expo)<br/>telas por nível de usuário"] -->|"fetch() + Bearer Token (JWT)"| API["API REST<br/>Node.js + Express"]
    API -->|"middleware: valida o JWT<br/>e o nível do usuário"| API
    API --> DB[("MySQL<br/>usuários, publicações,<br/>interações, comentários")]
```

Situação atual: telas, navegação e regras de acesso por nível (Entrega 1); API Express + MySQL integrados ao app
com `fetch()` (Entrega 2); login com JWT, Bearer Token e rotas protegidas por nível no back-end (Entrega 3).

### 1.5 Nome da aplicação

**Conexão Pais**, o mesmo nome do portal, com o slogan *"Ajudando a unir famílias e gerações."*

### 1.6 Tipos de usuário

Os níveis são os mesmos do site (`app_role`):

| Tipo | Nível | Quem é |
| --- | --- | --- |
| **Visitante** | — | Pessoa sem conta ou que ainda não entrou: lê os conteúdos e vê os profissionais |
| **Família** | `usuario` | Pai, mãe, avó/avô ou outro responsável |
| **Profissional** | `profissional` | Profissional parceiro. Começa **em verificação** e só publica depois de **aprovado** pela administração |
| **Administração** | `admin` | Equipe do Conexão Pais (curadoria, moderação e verificação) |

Situações do cadastro profissional: `pendente` → `aprovado`, `ajustes_solicitados` ou `recusado`.

### 1.7 Permissões iniciais

| Ação | Visitante | Família | Profissional em verificação | Profissional aprovado | Admin |
| --- | :---: | :---: | :---: | :---: | :---: |
| Ver boas-vindas, entrar e criar conta | ✅ | — | — | — | — |
| Ler artigos, colunas e revista | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ver profissionais e chamar no WhatsApp | ✅ | ✅ | ✅ | ✅ | ✅ |
| Enviar mensagem de contato | ✅ | ✅ | ✅ | ✅ | ✅ |
| Curtir, salvar e comentar | ❌ | ✅ | ✅ | ✅ | ✅ |
| Excluir o próprio comentário | ❌ | ✅ | ✅ | ✅ | ✅ |
| Publicar artigo | ❌ | ❌ | ❌ | ✅ | ✅ |
| Editar e excluir artigo | ❌ | ❌ | ❌ | só os próprios | todos |
| Excluir comentário de outra pessoa | ❌ | ❌ | ❌ | ❌ | ✅ |
| Aprovar, pedir ajustes ou recusar profissionais | ❌ | ❌ | ❌ | ❌ | ✅ |

**Mudança na Entrega 2:** a leitura passou a ser aberta a visitantes, como no site. A conta é pedida só para
interagir: ao tocar em Curtir ou Salvar sem conta, o app oferece Entrar; os campos de comentário e de pergunta dão
lugar a um convite para entrar ou criar conta. Depois do login, a pessoa volta para a tela onde estava.

São as mesmas regras do banco do site (políticas da tabela `publicacoes`: *"Admin e profissional aprovado
criam"*, *"Autor ou admin edita"*, *"Autor ou admin remove"*). Desde a Entrega 3 elas são garantidas **no back-end**
por middlewares de autenticação (JWT enviado como Bearer Token) e de autorização por nível (seção 3).

### 1.8 Principais funcionalidades

1. Cadastro com tipo de conta (família ou profissional, com profissão e número de registro) e login.
2. Início com destaques: artigo em destaque, revista atual, profissionais, colunas e "Como funciona".
3. Artigos com busca e filtro por categoria; leitura com curtir, salvar e comentários.
4. Colunas assinadas e revista digital com leitor página a página.
5. Diretório de profissionais com busca, filtro por especialidade e contato por WhatsApp.
6. Comunidade: conversas em andamento, destaques (mais curtidos e mais salvos), pergunta à equipe e regras.
7. Minha conta: dados e nível do usuário, situação do cadastro profissional, conteúdos salvos e logout.
8. Área de publicação: criar, editar e excluir artigos, conforme o nível.
9. Administração: verificação de novos profissionais.
10. Sobre (valores, história e equipe) e Contato.

### 1.9 Telas previstas

Todas as telas abaixo existem no app. A seção 2.2 mostra quais rotas da API cada uma usa.

| # | Tela | Acesso | Descrição |
| --- | --- | --- | --- |
| 1 | Boas-vindas | Visitante | Apresentação, foto da família, Entrar / Criar conta e Explorar sem conta |
| 2 | Entrar | Visitante | E-mail e senha (+ perfis de demonstração) |
| 3 | Criar conta | Visitante | Nome, e-mail, tipo de conta, profissão/registro (profissional) e senha |
| 4 | Início | Todos | Saudação, destaques e atalhos |
| 5 | Conteúdos | Todos | Artigos (busca e categorias), Colunas e Revista |
| 6 | Artigo | Todos | Leitura, curtir, salvar, comentários e conteúdos relacionados |
| 7 | Coluna | Todos | Apresentação da coluna e publicações |
| 8 | Revista | Todos | Capa, destaques e leitor página a página |
| 9 | Profissionais | Todos | Diretório com busca e filtro por especialidade |
| 10 | Perfil profissional | Todos | Dados, contato por WhatsApp, conteúdos e colunas |
| 11 | Comunidade | Todos | Recursos, conversas, destaques, pergunta à equipe e regras |
| 12 | Minha conta | Todos | Logado: perfil, nível, salvos, publicações e administração. Visitante: Entrar / Criar conta |
| 13 | Sobre | Todos | Valores, como surgiu e equipe |
| 14 | Contato | Todos | Formulário de mensagem para a equipe |
| 15 | Nova postagem / Editar artigo | Profissional aprovado e admin | Formulário do artigo |
| 16 | Novos profissionais | Somente admin | Aprovar, pedir ajustes ou recusar cadastros |

### 1.10 Fluxo inicial de navegação

```mermaid
flowchart TD
    W[Boas-vindas] --> L[Entrar]
    W --> C[Criar conta]
    W -->|explorar sem conta| T
    C -->|família ou profissional| L
    L --> T{{Abas do app}}

    T --> H[Início]
    T --> CT[Conteúdos]
    T --> P[Profissionais]
    T --> CM[Comunidade]
    T --> MC[Minha conta]

    H --> A[Artigo]
    CT --> A
    CT --> CO[Coluna]
    CT --> R[Revista]
    P --> PP[Perfil profissional]
    CM --> A
    MC --> S[Sobre]
    MC --> CTT[Contato]
    MC -->|sair| W

    MC -.->|profissional aprovado e admin| NP[Nova postagem / Editar]
    A -.->|autor ou admin| NP
    A -.->|visitante tenta curtir, salvar ou comentar| L
    MC -.->|somente admin| NV[Novos profissionais]
```

**Como a navegação está organizada (React Navigation):**

- **Stack raiz** (`native-stack`): as abas e as telas de leitura ficam disponíveis para todos. Boas-vindas, Entrar
  e Criar conta existem só para quem não entrou; **conforme o nível**, entram a área de publicação (`canPublish`)
  e a verificação de profissionais (`isAdmin`). Uma tela que não foi registrada não pode ser aberta.
- **Abas inferiores** (`bottom-tabs`): Início, Conteúdos, Profissionais, Comunidade e Minha conta.
- **Telas empilhadas sobre as abas:** Artigo, Coluna, Revista, Perfil profissional, Sobre, Contato, Nova postagem e
  Novos profissionais.

---

## 2. Planejamento técnico e integração (Entrega 2)

### 2.1 Requisitos funcionais atualizados

| # | Requisito | Situação |
| --- | --- | --- |
| RF01 | Criar conta de família ou profissional (profissão e registro), com senha salva em hash | ✅ API + banco |
| RF02 | Entrar com e-mail e senha conferidos pela API | ✅ API + banco · devolve um JWT (Entrega 3) |
| RF03 | Sair da conta | ✅ apaga o token do aparelho (Entrega 3) |
| RF04 | Listar artigos e buscar por termo e categoria | ✅ API + banco |
| RF05 | Ler o artigo completo | ✅ API + banco |
| RF06 | Publicar artigo (só profissional aprovado ou admin) | ✅ middleware `exigirPublicador` (Entrega 3) |
| RF07 | Editar e excluir artigo (autor ou admin) | ✅ middleware `autorDoArtigoOuAdmin` (Entrega 3) |
| RF08 | Curtir e salvar artigos; ver os salvos em Minha conta | ✅ API + banco |
| RF09 | Comentar e excluir o próprio comentário | ✅ API + banco · autor ou admin exclui (Entrega 3) |
| RF10 | Ver colunas e suas publicações | ✅ API + banco |
| RF11 | Ler a revista digital página a página | ✅ API + banco |
| RF12 | Buscar profissionais e ver o perfil com artigos e colunas | ✅ API + banco |
| RF13 | Enviar mensagem de contato e pergunta à equipe | ✅ API + banco |
| RF14 | Aprovar, pedir ajustes ou recusar cadastros profissionais (admin) | ✅ API + banco · só admin (Entrega 3) |
| RF15 | Proteger as rotas com token JWT e nível de usuário | ✅ Entrega 3 (seção 3) |
| RF16 | Ler conteúdos sem conta; para interagir, o app pede login e volta para a mesma tela depois | ✅ |
| RF17 | Continuar logado ao reabrir o app e sair sozinho quando o token vence, com aviso | ✅ Entrega 3 |

**Requisitos não funcionais já atendidos:** senha nunca é salva em texto (bcrypt); validação dos dados no app **e**
na API; consultas SQL com parâmetros (`?`), que evitam SQL injection; respostas de erro padronizadas
(`{ erro, campos }`) exibidas nas telas; credenciais do banco fora do repositório (`.env`). Na Entrega 3: token
JWT assinado (HS256) e com validade, segredo `JWT_SECRET` fora do repositório, token guardado criptografado no
aparelho e permissões conferidas no back-end em toda requisição protegida.

### 2.2 Telas e fluxos atualizados

As telas e a navegação continuam as da seção 1.10. O que mudou é a origem dos dados: agora tudo vem da API. Desde a
Entrega 3, as requisições de quem entrou levam o token no cabeçalho `Authorization: Bearer <token>`.

| Tela | Rotas da API usadas |
| --- | --- |
| Abertura do app | `GET /api/auth/perfil` (confere o token guardado) |
| Entrar | `POST /api/auth/login` |
| Criar conta | `POST /api/usuarios` |
| Início | `GET /api/artigos`, `GET /api/revistas`, `GET /api/profissionais`, `GET /api/colunas` |
| Conteúdos | `GET /api/artigos?busca=&categoria=`, `GET /api/categorias`, `GET /api/colunas`, `GET /api/revistas` |
| Artigo | `GET /api/artigos/:id`, `GET` e `POST /api/artigos/:id/comentarios`, `DELETE /api/comentarios/:id`, `POST /api/artigos/:id/interacoes`, `DELETE /api/artigos/:id` |
| Coluna | `GET /api/colunas/:slug` |
| Revista | `GET /api/revistas/:slug` |
| Profissionais / Perfil profissional | `GET /api/profissionais`, `GET /api/profissionais/:slug` |
| Comunidade | `GET /api/artigos`, `POST /api/artigos/:id/interacoes`, `POST /api/mensagens` |
| Minha conta | `GET /api/auth/perfil`, `GET /api/usuarios/:id/interacoes`, `DELETE /api/artigos/:id`; admin: `GET /api/usuarios?nivel=profissional&verificacao=pendente` |
| Nova postagem / Editar artigo | `POST /api/artigos`, `GET` e `PUT /api/artigos/:id`, `GET /api/categorias` |
| Novos profissionais | `GET /api/usuarios?nivel=profissional`, `PATCH /api/usuarios/:id/verificacao` |
| Contato | `POST /api/mensagens` |

**Caminho de uma requisição** (exemplo: publicar um artigo):

```mermaid
sequenceDiagram
    participant T as Tela Nova postagem
    participant S as services/artigosService.js
    participant R as Rota POST /api/artigos
    participant C as artigosController
    participant M as artigoModel
    participant DB as MySQL
    T->>S: criarArtigo(dados)
    S->>R: fetch() com JSON + Bearer Token
    R->>R: middlewares autenticar e exigirPublicador (seção 3.5)
    R->>C: criar(req, res)
    C->>C: valida os campos (autor = req.usuario)
    C->>M: criar(...)
    M->>DB: INSERT INTO publicacoes
    DB-->>M: id do novo artigo
    M-->>C: artigo com autor e totais
    C-->>S: 201 Created + JSON
    S-->>T: artigo formatado (a tela abre o artigo publicado)
```

Se algo der errado, a API responde com o status adequado (400, 401, 403, 404, 409, 503) e uma mensagem. A tela mostra
essa mensagem e, nos formulários, o erro aparece embaixo do campo correspondente.

### 2.3 Estrutura do banco de dados

Banco **`conexao_pais`** no MySQL, com 10 tabelas. Scripts: [`database/schema.sql`](database/schema.sql) (estrutura)
e [`database/seed.sql`](database/seed.sql) (conteúdo do site, contas de demonstração e interações iniciais).

```mermaid
erDiagram
    usuarios ||--o{ publicacoes : "escreve"
    usuarios ||--o{ comentarios : "comenta"
    usuarios ||--o{ interacoes : "curte e salva"
    publicacoes ||--o{ comentarios : "recebe"
    publicacoes ||--o{ interacoes : "recebe"
    usuarios |o--o| profissionais : "tem perfil público"
    usuarios ||--o{ colunas : "assina"
    colunas ||--o{ coluna_posts : "publica"
    revistas ||--o{ revista_paginas : "contém"
    usuarios |o--o{ mensagens : "envia"

    usuarios {
        int id PK
        varchar nome
        varchar email UK
        varchar senha_hash
        enum nivel
        varchar profissao
        varchar registro_profissional
        enum verificacao
        varchar observacao_admin
    }
    publicacoes {
        int id PK
        int autor_id FK
        enum tipo
        varchar slug UK
        varchar titulo
        varchar resumo
        text conteudo
        varchar categoria
        varchar tags
        tinyint destaque
        enum status
    }
    comentarios {
        int id PK
        int publicacao_id FK
        int usuario_id FK
        varchar texto
    }
    interacoes {
        int id PK
        int usuario_id FK
        int publicacao_id FK
        enum tipo
    }
    profissionais {
        int id PK
        int usuario_id FK
        varchar slug UK
        varchar nome
        varchar especialidade
        varchar descricao
        varchar cidade
        varchar atendimento
        varchar whatsapp
    }
    colunas {
        int id PK
        int colunista_id FK
        varchar slug UK
        varchar nome
        varchar chamada
        varchar periodicidade
        text sobre
    }
    coluna_posts {
        int id PK
        int coluna_id FK
        varchar slug
        varchar titulo
        varchar resumo
        text texto
        date publicado_em
    }
    revistas {
        int id PK
        varchar slug UK
        smallint edicao UK
        varchar titulo
        varchar subtitulo
        varchar descricao
        varchar categoria
        text destaques
        varchar pdf_url
        date publicada_em
    }
    revista_paginas {
        int id PK
        int revista_id FK
        smallint numero
        varchar secao
        varchar titulo
        text texto
    }
    mensagens {
        int id PK
        int usuario_id FK
        enum tipo
        varchar nome
        varchar email
        varchar assunto
        text mensagem
        enum status
    }
```

Decisões de modelagem:

- **`publicacoes` é a entidade principal**, com o mesmo nome e os mesmos campos da tabela do site. O campo `tipo`
  deixa espaço para os posts curtos da comunidade.
- **Um único `usuarios` para os três níveis** (`nivel`). A situação do cadastro profissional fica em `verificacao`,
  e só `profissional` aprovado ou `admin` pode publicar (regra conferida pela API).
- **`profissionais` é separado de `usuarios`**: o diretório mostra o perfil público, e a conta guarda o login.
  O vínculo (`usuario_id`) liga o perfil aos artigos e colunas da pessoa.
- **`interacoes` tem chave única (usuário + artigo + tipo)**: ninguém curte ou salva o mesmo artigo duas vezes.
- **Exclusões em cascata**: ao excluir um artigo, os comentários e as interações dele também saem.

### 2.4 Entidades e campos

| Entidade (tabela) | Campos principais | Relacionamentos |
| --- | --- | --- |
| Usuário (`usuarios`) | nome, e-mail (único), senha_hash, nível, profissão, registro, verificação | escreve publicações, comenta, curte/salva, assina colunas |
| **Publicação (`publicacoes`)** | autor, título, slug (único), resumo, conteúdo, categoria, tags, destaque, status | pertence a um usuário; tem comentários e interações |
| Comentário (`comentarios`) | publicação, usuário, texto, data | pertence a uma publicação e a um usuário |
| Interação (`interacoes`) | usuário, publicação, tipo (curtida/salvo) | une usuário e publicação |
| Profissional (`profissionais`) | slug, nome, especialidade, descrição, cidade, atendimento, WhatsApp | ligado (opcionalmente) a um usuário |
| Coluna (`colunas`) | colunista, slug, nome, chamada, periodicidade, sobre | tem várias publicações da coluna |
| Publicação da coluna (`coluna_posts`) | coluna, slug, título, resumo, texto, data | pertence a uma coluna |
| Revista (`revistas`) | edição (única), título, subtítulo, descrição, categoria, destaques, PDF, data | tem várias páginas |
| Página da revista (`revista_paginas`) | revista, número, seção, título, texto | pertence a uma edição |
| Mensagem (`mensagens`) | tipo (contato/pergunta), nome, e-mail, assunto, mensagem, status | enviada (opcionalmente) por um usuário |

O tipo, o tamanho, as chaves e a regra de exclusão de **cada campo** estão no dicionário de dados:
[`docs/banco-de-dados.md`](docs/banco-de-dados.md).

### 2.5 Principais rotas da API

Base: `http://localhost:3333/api`. Corpo e respostas em JSON. Exemplos prontos para testar estão em
[`api/requests.http`](api/requests.http).

| Método | Rota | O que faz |
| --- | --- | --- |
| GET | `/status` | Confere se a API e o banco estão respondendo |
| POST | `/auth/login` | Confere e-mail e senha e devolve o **token JWT** e o usuário |
| GET | `/auth/perfil` | Dados de quem está logado (pelo token) |
| POST | `/usuarios` | Cria conta (família ou profissional) |
| GET | `/usuarios?nivel=&verificacao=` | Lista contas (ex.: profissionais pendentes) |
| GET | `/usuarios/:id` | Dados de uma conta |
| GET | `/usuarios/:id/interacoes` | Curtidas e salvos da conta |
| PATCH | `/usuarios/:id/verificacao` | Aprova, pede ajustes ou recusa um cadastro profissional |
| GET | `/artigos?busca=&categoria=&autorId=` | **Lista artigos** (com autor e totais) |
| GET | `/artigos/:id` | **Artigo completo** |
| POST | `/artigos` | **Publica artigo** (201) |
| PUT | `/artigos/:id` | **Edita artigo** |
| DELETE | `/artigos/:id` | **Exclui artigo** (204) |
| GET | `/categorias` | Categorias com artigos publicados |
| GET / POST | `/artigos/:id/comentarios` | Lista / cria comentários |
| DELETE | `/comentarios/:id` | Exclui comentário |
| POST | `/artigos/:id/interacoes` | Liga/desliga curtida ou salvo e devolve o total |
| GET | `/profissionais`, `/profissionais/:slug` | Diretório e perfil (com artigos e colunas) |
| GET | `/colunas`, `/colunas/:slug` | Colunas e publicações |
| GET | `/revistas`, `/revistas/:slug` | Edições e páginas |
| POST | `/mensagens` | Contato ou pergunta à equipe |

Quem pode usar cada rota está na seção 3.6.

Organização do código da API (`api/src`): **routes** (endereços) → **middlewares** (token e nível, Entrega 3) →
**controllers** (validação, regras e resposta HTTP) → **models** (SQL) → **config/database.js** (pool de conexões com
o MySQL). Erros passam por um middleware central.

### 2.6 Níveis de usuário e permissões previstas na API

| Rotas | Quem pode usar (implementado na Entrega 3) |
| --- | --- |
| `GET /status`, `POST /auth/login`, `POST /usuarios` | Qualquer pessoa |
| `GET` de artigos, categorias, comentários, profissionais, colunas e revistas | Qualquer pessoa (visitante incluído) |
| `POST /artigos/:id/comentarios`, `POST /artigos/:id/interacoes`, `POST /mensagens` (pergunta) | Usuário logado (o id sai do token) |
| `POST /mensagens` (contato) | Qualquer pessoa |
| `GET /usuarios/:id`, `GET /usuarios/:id/interacoes` | O próprio usuário ou admin |
| `POST /artigos` | Profissional aprovado ou admin |
| `PUT /artigos/:id`, `DELETE /artigos/:id` | Autor do artigo ou admin |
| `DELETE /comentarios/:id` | Autor do comentário ou admin |
| `GET /usuarios`, `PATCH /usuarios/:id/verificacao` | Somente admin |

Na Entrega 2, a API já conferia a senha (bcrypt), impedia e-mail repetido e validava os campos, mas o app informava
quem era o usuário no corpo da requisição (`autorId`, `usuarioId`). Na Entrega 3, essa identidade passou a vir do
token enviado como Bearer Token, e os middlewares da seção 3.5 aplicam esta tabela.

---

## 3. Autenticação, JWT e controle de acesso (Entrega 3)

O app passa a ter usuários autenticados de verdade: no login a API entrega um **token JWT**, o app guarda esse token
no aparelho e o envia em toda requisição como **Bearer Token**, e **middlewares no back-end** decidem o que cada
nível pode fazer.

```
CADASTRO → LOGIN → JWT → NÍVEL → PERMISSÃO → CRUD
```

### 3.1 Caminho de uma ação protegida

Exemplo: a Dra. Helena (profissional aprovada) entra e publica um artigo.

```mermaid
sequenceDiagram
    participant App as App (AuthContext + api.js)
    participant API as API Express
    participant MW as Middlewares
    participant DB as MySQL
    App->>API: POST /auth/login { email, senha }
    API->>DB: busca a conta pelo e-mail
    API->>API: bcrypt.compare(senha, senha_hash)
    API-->>App: 200 { token, usuario }
    App->>App: guarda o token no aparelho (expo-secure-store)
    App->>API: POST /artigos com Authorization: Bearer + token
    API->>MW: autenticar
    MW->>MW: jwt.verify: assinatura e validade
    MW->>DB: busca a conta do token (nível atual)
    MW->>MW: exigirPublicador: admin ou profissional aprovado?
    MW->>API: req.usuario
    API->>DB: INSERT INTO publicacoes (autor = req.usuario.id)
    API-->>App: 201 Created + artigo
```

- Sem token, com token vencido ou adulterado: `autenticar` responde **401** e o app encerra a sessão.
- Token válido, mas o nível não permite a ação: **403**, e a tela mostra a mensagem da API.

### 3.2 Cadastro, login e proteção da senha

| Etapa | Onde | Como |
| --- | --- | --- |
| Cadastro | `POST /usuarios` → `usuariosController.cadastrar` | Valida os campos, impede e-mail repetido (409) e salva só o hash `bcrypt.hash(senha, 10)`. Ninguém se cadastra como admin; conta profissional nasce `pendente` |
| Login | `POST /auth/login` → `authController.login` | `bcrypt.compare` com o hash do banco. Senha errada e e-mail inexistente recebem a mesma resposta (401) no mesmo tempo, para não revelar quais e-mails têm conta |
| Respostas | `usuarioModel` | O hash nunca sai da API: só o login lê a coluna `senha_hash` |

### 3.3 O token JWT

Gerado em [`api/src/utils/token.js`](api/src/utils/token.js) com a biblioteca `jsonwebtoken`. Conteúdo de um token
(a parte do meio, decodificada):

```json
{ "nivel": "usuario", "iat": 1794222455, "exp": 1794827255, "sub": "3" }
```

- `sub` é o id da conta, `nivel` é o nível na hora do login e `exp` é a validade (`JWT_EXPIRES_IN`, padrão **7 dias**).
- O token é assinado com **HS256** e o segredo `JWT_SECRET`, que fica só no `api/.env` (fora do Git). Quem altera o
  conteúdo invalida a assinatura; sem o segredo, ninguém gera um token que a API aceite.
- A API não sobe sem um `JWT_SECRET` de pelo menos 32 caracteres. `npm run jwt:segredo` gera um aleatório e grava no `.env`.

### 3.4 Sessão no app

| O quê | Onde | Como |
| --- | --- | --- |
| Guardar o token | [`mobile/src/services/sessao.js`](mobile/src/services/sessao.js) | `expo-secure-store`, que criptografa os dados (Keystore no Android, Keychain no iOS). No Expo Web usa `localStorage`, só para testes |
| Enviar o token | [`mobile/src/services/api.js`](mobile/src/services/api.js) | Toda requisição de quem entrou leva `Authorization: Bearer <token>` |
| Continuar logado | [`mobile/src/contexts/AuthContext.js`](mobile/src/contexts/AuthContext.js) | Ao abrir, o app lê a sessão guardada (a tela de abertura espera) e confere o token em `GET /auth/perfil` |
| Sessão expirada | `api.js`, `AuthContext` e `App.js` | Se a API responder 401 a uma requisição feita com token, o app sai da conta e avisa *"Sua sessão expirou"*, com botão para entrar de novo |
| Logout | Minha conta → **Sair** | Pede confirmação e apaga o token do aparelho e da memória. As próximas requisições saem sem token |
| Atualizar a conta | `refreshUser` (ao abrir Minha conta) | `GET /auth/perfil` traz o nível e a situação atuais (ex.: cadastro profissional aprovado) |

O JWT não fica guardado no servidor (é *stateless*). Por isso o logout acontece no app, apagando o token, e a validade
limita o tempo de uso de um token que tenha ficado guardado em outro lugar.

### 3.5 Middlewares de autenticação e de nível

Em [`api/src/middlewares/`](api/src/middlewares):

| Middleware | O que confere | Se falhar |
| --- | --- | --- |
| `autenticar` | Token no formato `Bearer`, assinatura, validade e se a conta ainda existe. Deixa a conta em `req.usuario` | 401 |
| `autenticarSeHouverToken` | O mesmo, mas o token é opcional (contato, aberto a visitantes) | 401 se o token enviado for inválido |
| `permitirNiveis('admin')` | Nível da conta | 403 |
| `exigirPublicador` | Admin ou profissional **aprovado** | 403 |
| `proprioUsuarioOuAdmin` | O `:id` da rota é a própria pessoa, ou ela é admin | 403 |
| `autorDoArtigoOuAdmin` | Admin, ou autor do artigo que ainda pode publicar | 404 / 403 |
| `autorDoComentarioOuAdmin` | Admin, ou quem escreveu o comentário | 404 / 403 |

**O nível vem do banco, não só do token.** A cada requisição protegida, `autenticar` busca a conta pelo `sub` do
token. Assim, quando a administração aprova ou recusa um profissional, a mudança vale na hora, sem novo login, e
uma conta apagada perde o acesso mesmo com um token ainda dentro da validade.

**A identidade vem do token.** O app não envia mais `autorId` nem `usuarioId`; se alguém enviar, a API ignora.

### 3.6 Rotas protegidas e CRUD da entidade principal

Como fica no código ([`api/src/routes/artigos.routes.js`](api/src/routes/artigos.routes.js)):

```js
router.get('/', artigosController.listar); // aberta
router.get('/:id', artigosController.buscar); // aberta
router.post('/', autenticar, exigirPublicador, artigosController.criar);
router.put('/:id', autenticar, autorDoArtigoOuAdmin, artigosController.atualizar);
router.delete('/:id', autenticar, autorDoArtigoOuAdmin, artigosController.excluir);
```

| Rota | Middlewares | Visitante | Família | Prof. em verificação | Prof. aprovado | Admin |
| --- | --- | :---: | :---: | :---: | :---: | :---: |
| `GET` de artigos, categorias, comentários, profissionais, colunas e revistas | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| `POST /usuarios`, `POST /auth/login` | — | ✅ | ✅ | ✅ | ✅ | ✅ |
| `POST /mensagens` (contato) | `autenticarSeHouverToken` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `POST /mensagens` (pergunta) | `autenticarSeHouverToken` | 401 | ✅ | ✅ | ✅ | ✅ |
| `GET /auth/perfil` | `autenticar` | 401 | ✅ | ✅ | ✅ | ✅ |
| `POST /artigos/:id/comentarios`, `POST /artigos/:id/interacoes` | `autenticar` | 401 | ✅ | ✅ | ✅ | ✅ |
| `GET /usuarios/:id`, `GET /usuarios/:id/interacoes` | `autenticar`, `proprioUsuarioOuAdmin` | 401 | a própria | a própria | a própria | ✅ |
| `DELETE /comentarios/:id` | `autenticar`, `autorDoComentarioOuAdmin` | 401 | os próprios | os próprios | os próprios | ✅ |
| `POST /artigos` | `autenticar`, `exigirPublicador` | 401 | 403 | 403 | ✅ | ✅ |
| `PUT /artigos/:id`, `DELETE /artigos/:id` | `autenticar`, `autorDoArtigoOuAdmin` | 401 | 403 | 403 | os próprios | ✅ |
| `GET /usuarios`, `PATCH /usuarios/:id/verificacao` | `autenticar`, `permitirNiveis('admin')` | 401 | 403 | 403 | 403 | ✅ |

**CRUD completo da entidade principal (`publicacoes`):**

| Operação | Rota | Tela do app | Quem pode |
| --- | --- | --- | --- |
| Criar | `POST /artigos` | Nova postagem | Profissional aprovado e admin |
| Ler | `GET /artigos`, `GET /artigos/:id` | Início, Conteúdos, Artigo | Todos, inclusive visitantes |
| Atualizar | `PUT /artigos/:id` | Editar artigo | Autor ou admin |
| Excluir | `DELETE /artigos/:id` | Artigo e Minha conta | Autor ou admin |

No app, as telas continuam escondendo o que cada nível não pode fazer (seção 1.7), mas quem garante as regras é a
API: uma requisição feita fora do app, sem token ou com o nível errado, recebe 401 ou 403.

### 3.7 Testes

```bash
cd api
npm test
```

São 28 testes automatizados ([`api/tests/`](api/tests), com `node:test`, sem dependências extras). Eles sobem a API
numa porta livre e usam o banco do `.env` (rode `npm run db:setup` antes):

- **Cadastro e senha:** a resposta não traz a senha nem o hash; o banco guarda um hash bcrypt; e-mail repetido
  recebe 409; ninguém vira admin pelo cadastro.
- **Login e JWT:** 401 igual para senha errada e para e-mail inexistente; o token traz id, nível e validade.
- **Validação do token:** sem token, fora do formato `Bearer`, adulterado (nível trocado para admin), assinado com
  outro segredo, vencido ou de conta apagada: sempre 401.
- **Níveis e CRUD:** visitante, família, profissional pendente, aprovado e recusado e admin, cada um recebendo
  200/201/204, 401 ou 403 conforme a tabela da seção 3.6. Aprovação e recusa valem com o mesmo token, e `autorId` ou
  `usuarioId` enviados no corpo são ignorados.

Os testes apagam as contas e as mensagens que criam. Exemplos para testar à mão (com o token) estão em
[`api/requests.http`](api/requests.http).

---

## 4. Versão atual do app

| Boas-vindas | Início | Conteúdos | Artigo |
| --- | --- | --- | --- |
| ![Boas-vindas](docs/telas/boas-vindas.png) | ![Início](docs/telas/inicio.png) | ![Conteúdos](docs/telas/conteudos.png) | ![Artigo](docs/telas/artigo.png) |

| Revista | Perfil profissional | Comunidade | Minha conta |
| --- | --- | --- | --- |
| ![Revista](docs/telas/revista.png) | ![Perfil profissional](docs/telas/perfil-profissional.png) | ![Comunidade](docs/telas/comunidade.png) | ![Minha conta](docs/telas/minha-conta.png) |

| Criar conta (profissional) | Novos profissionais (admin) | Nova postagem | Artigo publicado |
| --- | --- | --- | --- |
| ![Criar conta](docs/telas/criar-conta.png) | ![Novos profissionais](docs/telas/novos-profissionais.png) | ![Nova postagem](docs/telas/nova-postagem.png) | ![Artigo publicado](docs/telas/artigo-publicado.png) |

Entrega 3 (sessão com JWT):

| Sair da conta (logout) | Token vencido: aviso | Entrar de novo |
| --- | --- | --- |
| ![Sair da conta](docs/telas/sair-da-conta.png) | ![Sessão expirada](docs/telas/sessao-expirada.png) | ![Entrar depois da sessão expirada](docs/telas/entrar-sessao-expirada.png) |

**O que já funciona:**

- 16 telas com React Navigation 7 (stack raiz + abas inferiores) e a identidade visual do site;
- telas e ações diferentes para cada nível (família, profissional em verificação, profissional aprovado e admin);
- visitantes leem tudo sem conta; para curtir, salvar, comentar ou perguntar, o app pede login;
- **todos os dados vêm do MySQL pela API**, com `fetch()`: cadastro, login, artigos (CRUD completo), comentários,
  curtidas, salvos, colunas, revista, profissionais, mensagens e verificação de profissionais;
- estados de carregamento e de erro em todas as telas, com opção de tentar de novo;
- validação nos formulários e na API, com os erros da API mostrados no campo certo;
- **login com JWT**: o token fica guardado no aparelho, vai em toda requisição como Bearer Token e mantém a pessoa
  logada ao reabrir o app; logout apaga o token; token vencido encerra a sessão com aviso;
- **permissões garantidas pela API**: middlewares conferem o token e o nível em cada rota protegida (seção 3).

**Próxima etapa (Entrega 4):** testes no aparelho, correções, README final, APK e apresentação.

### Contas de demonstração

Criadas pelo `database/seed.sql`. Na tela **Entrar**, os botões do *Modo demonstração* preenchem estas contas:

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Família | `familia@conexaopais.test` | `123456` |
| Profissional aprovado (Dra. Helena Prado) | `profissional@conexaopais.test` | `123456` |
| Administração | `admin@conexaopais.test` | `123456` |

Os autores dos outros artigos e colunas também têm conta (`marcos@`, `bianca@` e `rafael@conexaopais.test`, mesma
senha), e há dois cadastros profissionais de exemplo aguardando a análise da administração.

Para ver o fluxo completo de níveis: crie uma conta **Profissional**, entre com ela (fica em verificação), entre
como **Administração** e aprove o cadastro em *Minha conta → Novos profissionais*, depois entre de novo com a conta
profissional e publique um artigo.

---

## 5. Tecnologias

| Camada | Tecnologia |
| --- | --- |
| App | React Native 0.88 + Expo SDK 58 (JavaScript) |
| Navegação | React Navigation 7 (`native-stack` e `bottom-tabs`) |
| Comunicação | `fetch()` com JSON e Bearer Token (camada `src/services`) e `expo-constants` para achar o IP da API |
| Sessão no aparelho | `expo-secure-store` (token criptografado) |
| Visual | `@expo/vector-icons` (Ionicons), `expo-font` com Fraunces e DM Sans (`@expo-google-fonts`) |
| Estado | React Context (autenticação, artigos, comunidade, confirmação) e hook `useApi` |
| API | Node.js 20+ e Express 5 (`cors`, `dotenv`) |
| Banco | MySQL 8 (ou MariaDB 10.6+) com `mysql2` (pool de conexões e consultas parametrizadas) |
| Senhas | `bcryptjs` (hash) |
| Autenticação | JWT com `jsonwebtoken` (HS256), enviado como Bearer Token |
| Testes da API | `node:test` (embutido no Node.js) |

## 6. Estrutura do repositório

```
conexaopais.app/
├── README.md
├── database/
│   ├── schema.sql            # cria o banco conexao_pais e as 10 tabelas
│   └── seed.sql              # conteúdo do site, contas de demonstração e interações
├── api/                      # API REST (Node.js + Express)
│   ├── .env.example          # modelo de configuração (o .env real não vai para o Git)
│   ├── requests.http         # exemplos de requisições (login e rotas com Bearer Token)
│   ├── scripts/
│   │   ├── setup-db.js       # npm run db:setup: executa schema.sql + seed.sql
│   │   └── gerar-segredo.js  # npm run jwt:segredo: grava um JWT_SECRET aleatório no .env
│   ├── tests/                # npm test: cadastro, JWT, níveis e CRUD
│   └── src/
│       ├── server.js         # confere o JWT_SECRET e sobe o servidor na porta 3333
│       ├── app.js            # Express, CORS, JSON, rotas e tratamento de erros
│       ├── config/           # conexão com o MySQL (pool)
│       ├── routes/           # endereços da API e os middlewares de cada rota
│       ├── middlewares/      # autenticacao.js (JWT), permissoes.js (níveis) e erros
│       ├── controllers/      # validação, regras e respostas HTTP
│       ├── models/           # consultas SQL
│       └── utils/            # token.js (gera e confere o JWT), validação e texto
├── docs/
│   ├── banco-de-dados.md     # dicionário de dados (todos os campos)
│   └── telas/                # imagens das telas usadas neste README
└── mobile/                   # aplicativo React Native (Expo)
    ├── App.js                # fontes, provedores de contexto e NavigationContainer
    ├── app.json              # nome, ícone, splash e pacote Android (app.conexaopais)
    ├── .env.example          # EXPO_PUBLIC_API_URL (opcional)
    ├── assets/               # logo da árvore, ícones, splash e fotos do site
    └── src/
        ├── services/         # api.js (fetch + Bearer Token), sessao.js (token no aparelho) e serviços por recurso
        ├── hooks/            # useApi (carregando / erro / recarregar)
        ├── components/       # Button, TextField, ArticleCard, AsyncState...
        ├── contexts/         # AuthContext, ContentContext (CRUD de artigos), CommunityContext...
        ├── data/             # textos institucionais fixos (Sobre e Comunidade)
        ├── navigation/       # RootNavigator (stack por nível), AppTabs (abas) e tema
        ├── screens/          # auth/, app/, publish/ e admin/
        ├── theme/            # cores, fontes, espaçamentos e estilos de texto do site
        └── utils/            # validações e funções de texto
```

## 7. Como executar

Pré-requisitos: [Node.js](https://nodejs.org) 20 ou superior, **MySQL 8** (ou MariaDB 10.6+, como no XAMPP) e o app
**Expo Go** no celular. O celular e o computador precisam estar **na mesma rede Wi-Fi**.

### 7.1 Banco de dados e API

```bash
cd api
npm install
```

Copie `api/.env.example` para `api/.env` e coloque o usuário e a senha do seu MySQL. Depois gere o segredo que
assina os tokens JWT (ele é gravado no `.env`, que não vai para o Git):

```bash
npm run jwt:segredo
```

Crie o banco com os dados iniciais (isso executa `database/schema.sql` e `database/seed.sql`):

```bash
npm run db:setup
```

> Também dá para rodar os dois arquivos `.sql` no MySQL Workbench, nessa ordem.

Se o `db:setup` falhar, a mensagem diz o motivo:

- *"Não há MySQL respondendo em 127.0.0.1:3306"*: o MySQL está desligado. No Windows, abra **Serviços**
  (`services.msc`) e inicie o serviço **MySQL80**; no XAMPP, clique em **Start** na linha do MySQL. Confira também
  a porta (`DB_PORT`) no `.env`.
- *"O MySQL recusou o usuário ou a senha"*: corrija `DB_USER` e `DB_PASSWORD` no `.env`.
- *"Arquivo api/.env não encontrado"*: copie o `.env.example` para `.env`.

Suba a API (ela reinicia sozinha quando o código muda):

```bash
npm run dev
```

Se aparecer *"JWT_SECRET não está definido"*, rode `npm run jwt:segredo` e suba de novo.

Teste no navegador: <http://localhost:3333/api/status> deve mostrar `{"api":"ok","banco":"ok"}`. Para rodar os
testes automatizados (com o MySQL ligado):

```bash
npm test
```

> **Atualizando de uma versão anterior** (`git pull`): rode `npm install` de novo em `api/` e em `mobile/` (entraram
> `jsonwebtoken` e `expo-secure-store`) e `npm run jwt:segredo` uma vez.

### 7.2 App

Em outro terminal:

```bash
cd mobile
npm install
npx expo start
```

Leia o QR Code com o Expo Go. O app encontra a API sozinho, usando o IP do computador que está rodando o Expo, na
porta 3333. Se o app mostrar *"Não foi possível conectar à API"*:

- confira se a API está rodando e se o celular está no mesmo Wi-Fi;
- libere a porta **3333** no firewall do computador (no Windows, permita o Node.js em redes privadas);
- ou informe o endereço manualmente: crie `mobile/.env` com `EXPO_PUBLIC_API_URL=http://IP_DO_COMPUTADOR:3333/api`
  e reinicie com `npx expo start -c`.

No navegador do computador: `npx expo start --web`.

---

## 8. Próximas entregas

- **Entrega 4:** testes no aparelho, correções, README final, APK e apresentação. No APK, o Android bloqueia HTTP
  sem criptografia: será preciso liberar o acesso à API local (`usesCleartextTraffic`) ou publicar a API com HTTPS.

## Autoria

Desenvolvido por **Ana Elisa Sprenger** ([@anasprenger](https://github.com/anasprenger)).
