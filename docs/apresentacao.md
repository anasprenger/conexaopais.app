# Roteiro da apresentação: Conexão Pais

Roteiro para cerca de 12 minutos, na ordem dos itens de *Apresentação e defesa* do PDF. Os tempos são sugestões.

## Antes de começar (checklist)

- [ ] MySQL ligado e banco recriado com os dados de exemplo: `cd api` → `npm run db:setup`
- [ ] API rodando: `npm run dev` (anote o endereço *"No celular… http://192.168.x.x:3333/api"*)
- [ ] Celular e notebook no mesmo Wi-Fi; APK instalado; em **Conexão com a API**, **Testar** dá "Conexão funcionando"
- [ ] App aberto **sem conta** (se estiver logado, *Minha conta* → *Sair*)
- [ ] Abertos no notebook: o repositório no GitHub, o VS Code com o projeto e o MySQL Workbench
- [ ] Plano B: se a rede da sala bloquear o celular, ligue o roteador do celular e conecte o notebook nele

Contas de demonstração (senha `123456`): `familia@`, `profissional@` e `admin@conexaopais.test`. Na tela *Entrar*,
os botões do *Modo demonstração* preenchem e-mail e senha.

---

## 1. O problema (1 min)

> Quem cuida de crianças e adolescentes tem dúvidas todos os dias. Informação existe de sobra, mas está espalhada,
> nem sempre é confiável e muitas vezes vem com julgamento. Quem cuida acaba se sentindo sozinho para decidir.

- Público: pais, mães, avós e outros responsáveis; profissionais que atendem famílias.
- O Conexão Pais já existe como site; o app leva o projeto para o celular, onde a dúvida aparece.

## 2. A solução (1 min)

- Conteúdo confiável (artigos de profissionais com autoria visível), colunas e revista digital.
- Diretório de profissionais **verificados** pela administração.
- Comunidade: curtir, salvar, comentar e perguntar à equipe.
- Quatro tipos de usuário: **visitante** (lê sem conta), **família**, **profissional** (só publica depois de aprovado) e
  **administração**.
- Arquitetura: App React Native (Expo) → `fetch()` com Bearer Token → API Node.js + Express → MySQL.

## 3. Cadastro e login (2 min): demonstração

1. Boas-vindas → **Explorar sem conta**: mostre que dá para ler um artigo sem conta.
2. Toque em **Curtir**: o app pede para entrar. *"Ler é aberto; interagir exige conta."*
3. **Criar minha conta** → tipo **Profissional**, com profissão e registro → criar. Volta para *Entrar* com o aviso
   de que o registro será conferido.
4. Entre com a conta nova → *Minha conta*: **"Sua conta profissional ainda está em verificação"** e não há *Nova
   postagem*.

O que dizer sobre a **senha**:

> A senha nunca é guardada. A API gera um **hash com bcrypt** e salva só o hash. No login, o bcrypt compara a senha
> digitada com o hash. Se a senha estiver errada ou o e-mail não existir, a resposta é a mesma (401), para não revelar
> quem tem conta.

Código: `api/src/controllers/usuariosController.js` (cadastro) e `api/src/controllers/authController.js` (login).

## 4. JWT, token, middleware e permissões (3 min): explicação

**Token JWT.** No login, a API devolve um token assinado:

```json
{ "nivel": "profissional", "iat": 1794222455, "exp": 1794827255, "sub": "9" }
```

- `sub` é o id do usuário; `exp`, a validade (7 dias).
- A assinatura usa o `JWT_SECRET`, que fica só no `.env` do servidor (fora do GitHub). Se alguém trocar
  `"nivel"` para `"admin"`, a assinatura deixa de conferir e a API recusa.
- Código: `api/src/utils/token.js`.

**No app.** O token fica guardado no celular com `expo-secure-store` (criptografado) e vai em toda requisição no
cabeçalho `Authorization: Bearer <token>`. Por isso, ao fechar e abrir o app, a pessoa continua logada.
Código: `mobile/src/services/sessao.js` e `mobile/src/services/api.js`.

**Middleware.** É uma função que roda **antes** do controller e decide se a requisição continua:

```js
router.post('/', autenticar, exigirPublicador, artigosController.criar);
```

1. `autenticar` (`api/src/middlewares/autenticacao.js`): confere o token. Sem token, inválido ou vencido → **401**.
   Busca o usuário no banco e guarda em `req.usuario`.
2. `exigirPublicador` (`api/src/middlewares/permissoes.js`): só deixa passar admin ou profissional aprovado. Senão →
   **403**.
3. Só então o controller cria o artigo, com o autor tirado do token (não do que o app manda).

> **401** = não sei quem você é (falta login). **403** = sei quem você é, mas você não tem permissão.

**Por que o nível é lido do banco a cada requisição?** Para que a aprovação do admin valha na hora, sem novo login,
e para que uma conta apagada perca o acesso mesmo com o token ainda válido.

**Logout.** Apaga o token do celular. O JWT não fica guardado no servidor, e a validade de 7 dias limita um token
esquecido em outro lugar. Se o token vence, o app avisa *"Sua sessão expirou"*.

## 5. Níveis de usuário (2 min): demonstração

1. *Minha conta* → **Sair** (confirme) → entre como **Administração**.
2. *Minha conta* → **Novos profissionais** → aprove a conta criada no passo 3.
3. Saia e entre com a conta profissional: agora aparece **Nova postagem**.
   *"A permissão não está só escondida na tela: quem garante é a API."*
4. (Opcional) Mostre no `api/requests.http` uma tentativa de publicar com o token da família → **403**.

## 6. CRUD da entidade principal (2 min): demonstração

Com a conta profissional aprovada:

1. **Criar:** *Minha conta* → *Nova postagem* → preencha → *Publicar*. O artigo abre já publicado.
2. **Ler:** volte a *Conteúdos*; o artigo aparece na lista e na busca.
3. **Atualizar:** no artigo, **Editar** → mude o título → salvar.
4. **Excluir:** **Excluir** → confirmar.
5. Entre como **Família** e abra um artigo: não há *Editar* nem *Excluir*. *"Só o autor ou a administração."*

Rotas: `POST`, `GET`, `PUT` e `DELETE` em `/api/artigos`, com os middlewares `exigirPublicador` e
`autorDoArtigoOuAdmin`.

## 7. O banco de dados (1 min): MySQL Workbench

```sql
USE conexao_pais;
SHOW TABLES;                                                  -- as 10 tabelas
SELECT id, nome, email, nivel, verificacao, senha_hash FROM usuarios;  -- senha só como hash ($2b$10$...)
SELECT id, autor_id, titulo, criado_em FROM publicacoes ORDER BY id DESC;  -- o artigo da demonstração
```

- `publicacoes` é a entidade principal, ligada ao autor (`autor_id`).
- Ao excluir um artigo, comentários e curtidas dele saem junto (`ON DELETE CASCADE`).
- Diagrama e dicionário de dados: README, seção 2.3, e `docs/banco-de-dados.md`.

## 8. Repositório e testes (1 min)

- Mostre o histórico de commits no GitHub: uma etapa por commit (`feat`, `fix`, `test`, `docs`), organizada por
  entrega.
- No terminal, `cd api` → `npm test`: **28 testes** passando (cadastro, hash, JWT, níveis e CRUD).
- O README documenta cada entrega (seções 1 a 4).

## 9. O APK (30 s)

- Mostre o app instalado no celular (ícone *Conexão Pais*, fora do Expo Go).
- Gerado com EAS Build a partir da mesma versão do repositório (README, seção 4.3).
- A tela **Conexão com a API** resolve a troca de IP do notebook entre redes, sem gerar outro APK.

---

## Perguntas prováveis

**Por que JWT e não sessão no servidor?**
O token carrega quem é a pessoa e é conferido pela assinatura, sem o servidor guardar sessões. Combina com app
mobile e API REST.

**Onde fica o token no celular? É seguro?**
No `expo-secure-store`, que usa o armazenamento criptografado do sistema (Keystore no Android). Ele não fica em texto
aberto.

**E se alguém pegar o token?**
Ele vale até vencer (7 dias). Por isso a validade é limitada e o token nunca é mostrado nem enviado fora do
cabeçalho. Com HTTPS em produção, ele também não trafega aberto na rede.

**Por que a API usa HTTP e não HTTPS?**
Na demonstração, a API roda no notebook, na rede local. Para publicar de verdade, a API iria para um servidor com
HTTPS, e o `usesCleartextTraffic` sairia do `app.json`.

**O que impede um usuário de mandar o id de outra pessoa?**
A API ignora ids enviados no corpo (`autorId`, `usuarioId`). Quem é o usuário sai sempre do token.

**Por que as telas também escondem botões, se a API já protege?**
Para a experiência: a pessoa só vê o que pode fazer. A segurança, porém, está na API; uma requisição feita fora do
app recebe 401 ou 403.

**O que é o hash? Dá para voltar à senha?**
É uma transformação de mão única com "sal" aleatório (bcrypt, custo 10). Não dá para voltar; só comparar.
