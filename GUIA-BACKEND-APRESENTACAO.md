# Guia rápido do backend — Projeto de livros

Este guia explica **por partes**, sem detalhar cada linha, o código da versão enviada para comentário.
Os comentários adicionados nos arquivos também são curtos e separam os blocos principais.

## 1. Por onde começar a apresentação

**`app.js` — Ponto de entrada.** Carrega o Express, configura formulários, páginas, sessões de login e mensagens, liga as rotas ao site e conecta ao MongoDB antes de iniciar na porta 3000 (padrão).

**`routes/usuario.js` — Contas.** Mostra o cadastro e login, registra usuários com senha protegida, encerra sessões e permite editar os dados da própria conta.

**`routes/livros.js` — CRUD das resenhas.** Lista livros, permite ao usuário logado criar uma publicação com capa, título, comentário e estrelas, editar/excluir a própria publicação e consultar detalhes e avaliações de livros.

**`routes/admin.js` — Administração.** Usa o bloqueio `eAdmin` e permite ao administrador cadastrar, editar ou excluir livros e listar/excluir avaliações.

**`config/auth.js` — Login.** Verifica email e senha com Passport e recupera a conta nas requisições seguintes.

**`helpers/conta.js` — Permissões.** `eUser` exige login; `eAdmin` exige login e nível de administrador.

**`helpers/imagem.js` — Capas.** Confere se a imagem recebida é JPG/PNG/WebP, limita a 2 MB, salva em `public/uploads` e remove capas quando necessário.

## 2. Modelos e MongoDB

| Arquivo | Guarda o quê? |
| --- | --- |
| `models/Usuario.js` | Nome, email, endereço, senha e indicador de administrador (`eAdmin`). |
| `models/Livro.js` | Título, autor, capa e dados do livro; o campo `usuario` identifica quem publicou, quando aplicável. |
| `models/Avaliacao.js` | Comentário e nota de 1 a 5 estrelas ligados a um livro e a um usuário. |
| `models/Comentario.js` | Mensagens da página de contato; **não** são as avaliações dos livros. |

**Por que existem `Livro` e `Avaliacao` separados?** Porque a estrutura original guarda os dados do livro em um modelo e a nota/comentário em outro. Isso permite que um livro tenha avaliações de vários usuários. A resenha publicada pelo autor cria um registro nos dois modelos.

## 3. Exemplo para explicar o cadastro de uma resenha

1. O usuário entra e abre **`GET /livros/novo`**; o servidor mostra o formulário.
2. No navegador, `public/js/imagem-resenha.js` prepara a imagem para envio. Esse arquivo é **frontend** e não foi comentado.
3. O formulário envia os dados para **`POST /livros/novo`**, em `routes/livros.js`.
4. A rota verifica título, comentário e nota. `helpers/imagem.js` salva a capa em `public/uploads`.
5. O backend cria o `Livro` e a `Avaliacao` no MongoDB.
6. O navegador é direcionado para **`GET /livros/:id`**, que exibe a publicação e as avaliações.

## 4. CRUD em linguagem simples

| Operação | Onde acontece | O que faz |
| --- | --- | --- |
| **Create** | `POST /livros/novo` | Publica uma nova resenha com imagem e avaliação. |
| **Read** | `GET /livros` e `GET /livros/:id` | Lista os livros e mostra detalhes e avaliações. |
| **Update** | `GET/POST /livros/:id/editar` | Autor edita sua publicação, inclusive a capa. |
| **Delete** | `POST /livros/:id/excluir` | Autor exclui a própria resenha. |

Além desse CRUD, o administrador tem rotas próprias em `/admin` e outros usuários podem avaliar um livro com `POST /livros/:id/avaliar`.

## 5. Conceitos para explicar ao professor

- **Rota:** endereço + tipo de requisição (`GET` abre/consulta; `POST` envia ou altera informações).
- **`req` e `res`:** `req` contém os dados da requisição; `res` devolve página, resposta ou redirecionamento.
- **Model:** estrutura de dados usada pelo Mongoose para salvar e consultar documentos no MongoDB.
- **Autenticação:** verifica quem entrou na conta; **autorização:** decide o que essa pessoa pode fazer.
- **`eAdmin`:** `0` é usuário comum; `1` é administrador. O registro público define `0`.
- **`req.flash`:** mostra mensagens de sucesso ou erro após uma ação.
- **`public/uploads`:** pasta local das capas enviadas pelo formulário.

## 6. O que mudou nesta entrega

Foram acrescentados **apenas comentários explicativos** nos arquivos JavaScript do backend (`app.js`, `config`, `helpers`, `models`, `routes`). A lógica, os nomes, os endpoints, os templates do frontend, as bibliotecas e o `package.json` foram preservados. Este guia é o único documento novo.

### Para testar

No PowerShell do VS Code, com MongoDB local em execução:

```powershell
npm.cmd install
node app.js
```

Abra `http://localhost:3000`. Este ZIP não inclui `node_modules` nem o histórico local `.git`; copie os arquivos para seu repositório já existente quando quiser subir ao GitHub.
