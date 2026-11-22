// Importa as bibliotecas e os arquivos de rotas usados pelo servidor.
const express = require('express')
const handlebars = require('express-handlebars')
const session = require('express-session')
const flash = require('connect-flash')
const mongoose = require('mongoose')
const passport = require('passport')
const path = require('path')

const admin = require('./routes/admin')
const usuarios = require('./routes/usuario')
const livros = require('./routes/livros')
require('./models/Usuario')
require('./models/Livro')
require('./models/Avaliacao')

// Prepara o Express para receber formulários, JSON e arquivos públicos.
const app = express()
app.use(express.urlencoded({ extended: true, limit: '4mb' }))
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

// Configura as páginas Handlebars e os recursos usados para exibir notas.
app.set('views', path.join(__dirname, 'views'))
app.engine('handlebars', handlebars.engine({
    defaultLayout: 'main',
    helpers: {
        eq: (a, b) => String(a) === String(b),
        estrelas: (nota) => '★'.repeat(Number(nota)) + '☆'.repeat(5 - Number(nota))
    }
}))
app.set('view engine', 'handlebars')

// Configura sessões, login e mensagens que aparecem nas páginas.
app.use(session({
    secret: process.env.SESSION_SECRET || 'troque-esta-chave-de-sessao',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 60 * 1000, httpOnly: true, sameSite: 'lax' }
}))
app.use(flash())
require('./config/auth')(passport)
app.use(passport.initialize())
app.use(passport.session())
app.use((req, res, next) => {
    res.locals.user = req.user ? req.user.toObject() : null
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error = req.flash('error')
    next()
})

// Separa os endereços do site por área: administração, usuários e livros.
app.use('/admin', admin)
app.use('/usuarios', usuarios)
app.use('/livros', livros)

// Define a página inicial e recebe mensagens do formulário de contato.
app.get('/', (req, res) => res.redirect('/livros'))
app.get('/contato', (req, res) => res.render('contato'))
app.post('/contato/enviar', async (req, res) => {
    try {
        const Contato = require('./models/Comentario')
        const { nome, email, texto } = req.body
        if (!nome || !email || !texto) {
            req.flash('error_msg', 'Preencha todos os campos do contato.')
            return res.redirect('/contato')
        }
        await Contato.create({ nome, email, texto })
        req.flash('success_msg', 'Mensagem enviada com sucesso!')
        res.redirect('/contato')
    } catch (erro) {
        console.error(erro)
        req.flash('error_msg', 'Não foi possível enviar sua mensagem.')
        res.redirect('/contato')
    }
})

// Conecta ao MongoDB e só inicia o servidor após confirmar a conexão.
const PORT = process.env.PORT || 3000
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/appAdmin'

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Conectado ao MongoDB')
        app.listen(PORT, () => console.log(`Servidor iniciado em http://localhost:${PORT}`))
    })
    .catch(erro => {
        console.error('Não foi possível conectar ao MongoDB:', erro.message)
        process.exit(1)
    })
