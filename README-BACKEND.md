# Backend do projeto de avaliação de livros

## Tecnologias
- Node.js e Express
- MongoDB e Mongoose
- Passport Local para autenticação
- bcryptjs para hash de senhas
- Express Handlebars para as páginas

## Instalação
1. Instale o Node.js e inicie o MongoDB localmente (ou configure um banco no MongoDB Atlas).
2. No terminal, dentro da pasta do projeto, execute `npm install`.
3. Opcionalmente, copie `.env.example` para `.env` e ajuste `MONGO_URI`, `SESSION_SECRET` e `PORT`. Para carregar `.env`, instale `dotenv` e adicione `require('dotenv').config()` no início do `app.js`.
4. Execute `npm start`.
5. Acesse `http://localhost:3000`.

## Tornar uma conta administradora
Por segurança, o formulário público sempre cria contas com `eAdmin: 0`. Primeiro crie uma conta normalmente. Depois, no MongoDB Compass, abra o banco `appAdmin`, coleção `usuarios`, localize o usuário pelo e-mail e altere `eAdmin` para o número `1` (não texto). Faça logout e login novamente.

Também é possível usar o Mongo Shell, substituindo o e-mail:

```js
db.usuarios.updateOne({ email: "admin@exemplo.com" }, { $set: { eAdmin: 1 } })
```

## Rotas principais
### Públicas
- `GET /livros` - lista os livros.
- `GET /livros/:id` - detalhes e avaliações do livro.
- `GET /usuarios/registro` - formulário de cadastro.
- `POST /usuarios/registro/cad` - cria usuário comum.
- `GET /usuarios/login` e `POST /usuarios/login` - login.

### Usuário autenticado
- `POST /livros/:id/avaliar` - cria ou atualiza a própria avaliação (1 a 5 estrelas).
- `GET /usuarios/conta` - consulta a própria conta.
- `POST /usuarios/conta/edit` - altera a própria conta.

### Administrador (`eAdmin: 1`)
- `GET /admin` - painel.
- `GET /admin/livros` - lista livros.
- `GET /admin/livros/novo` e `POST /admin/livros/novo` - cadastra livro.
- `GET /admin/livros/editar/:id` e `POST /admin/livros/editar/:id` - edita livro.
- `POST /admin/livros/excluir/:id` - exclui livro e avaliações associadas.
- `GET /admin/avaliacoes` - lista avaliações.
- `POST /admin/avaliacoes/excluir/:id` - exclui avaliação.

## Regras
- O cadastro público não permite escolher o próprio nível de acesso.
- Usuários precisam estar autenticados para avaliar.
- Cada usuário pode manter uma avaliação por livro; enviar outra nota atualiza a avaliação anterior.
- Somente administradores podem cadastrar, editar ou excluir livros e excluir avaliações.

---

# Backend do projeto de avaliação de livros

Projeto escolar com Node.js, Express, MongoDB/Mongoose, Passport e Handlebars. **Mantém a estrutura e as dependências originais**, sem instalar pacotes novos.

## Para executar
1. Inicie o MongoDB localmente.
2. Execute `npm install` dentro da pasta.
3. Execute `npm start`.
4. Abra `http://localhost:3000`.

O app usa `mongodb://127.0.0.1:27017/appAdmin` por padrão. Se quiser usar outro banco, configure a variável de ambiente `MONGO_URI` ao iniciar o Node. O arquivo `.env` não é carregado automaticamente (como no projeto original).

## Fluxo principal para apresentar
1. Cadastre-se em `/usuarios/registro` e faça login.
2. Clique em **Publicar resenha**.
3. Escolha a **imagem da capa** (JPG, PNG ou WebP, até 2 MB), escreva **título**, **comentário** e **nota de 1 a 5 estrelas**.
4. Salve; a resenha aparecerá em `/livros`.
5. Abra a resenha; o autor pode usar **Editar minha resenha** ou **Excluir minha resenha**.
6. Outro usuário logado pode avaliar esse livro usando o formulário que já existia.

## O que foi alterado (simples)
- `models/Livro.js`: campo opcional `usuario` identifica quem publicou o livro. Os livros antigos continuam válidos.
- `routes/livros.js`: rotas de criar/editar/excluir publicações feitas pelos próprios usuários; mantidas as rotas originais de listagem, detalhes e avaliações.
- `helpers/imagem.js`: valida JPG/PNG/WebP, limita a 2 MB e salva imagem em `public/uploads`.
- `views/livros/form-resenha.handlebars`: formulário com título, capa, comentário e estrelas.
- `public/js/imagem-resenha.js`: converte a imagem selecionada em base64 para que o Express receba o arquivo **sem precisar instalar Multer**. O backend decodifica e grava a imagem como arquivo de verdade.
- `app.js`: aumenta o limite da requisição para aceitar imagens pequenas.
- Páginas existentes: botões de publicar/editar/excluir.

## Rotas novas
- `GET /livros/novo` e `POST /livros/novo` — publicar.
- `GET /livros/:id/editar` e `POST /livros/:id/editar` — editar a própria resenha.
- `POST /livros/:id/excluir` — excluir a própria resenha.

## Mantido do original
- Autenticação/cadastro de usuários.
- Cadastro/edição/exclusão de livros pelo administrador (`/admin`).
- Avaliações de livros (`POST /livros/:id/avaliar`) e notas de 1 a 5 estrelas.
- Página de contato, layouts, Bootstrap, banco de dados e demais arquivos.

## Observações
- As capas enviadas ficam em `public/uploads` no computador que executa o projeto. Mantenha a pasta quando for apresentar em outro PC.
- O formulário de upload precisa de JavaScript ativo no navegador para converter a imagem antes de enviar.
- Por ser projeto escolar local, foi escolhida uma solução sem bibliotecas extras, não um sistema de upload para produção.
- O livro precisa existir com o campo `autor` por causa do modelo original; resenhas criadas pelo usuário recebem `autor: 'Não informado'` automaticamente.
- O administrador continua podendo criar livros pelo formulário antigo usando URL de capa.
- O teste completo depende de um MongoDB rodando e de um navegador.
