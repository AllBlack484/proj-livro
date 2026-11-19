const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const passport = require('passport')
const Usuario = require('../models/Usuario')
const { eUser } = require('../helpers/conta')

router.get('/registro', (req, res) => res.render('registro'))

router.post('/registro/cad', async (req, res) => {
    const { nome, email, cep, logradouro, complemento, bairro, localidade, uf, numero, senha, senha2 } = req.body
    const erros = []
    if (!nome || !email || !cep || !logradouro || !bairro || !localidade || !uf || !numero) erros.push({ texto: 'Preencha todos os campos obrigatórios.' })
    if (!senha || senha.length < 8) erros.push({ texto: 'A senha deve ter pelo menos 8 caracteres.' })
    if (senha !== senha2) erros.push({ texto: 'As senhas são diferentes.' })
    if (erros.length) return res.status(400).render('registro', { erros })

    try {
        const emailNormalizado = email.toLowerCase().trim()
        const existente = await Usuario.findOne({ email: emailNormalizado })
        if (existente) {
            req.flash('error_msg', 'Já existe uma conta com este e-mail.')
            return res.redirect('/usuarios/registro')
        }
        const senhaHash = await bcrypt.hash(senha, 10)
        await Usuario.create({
            nome, email: emailNormalizado, cep, logradouro, complemento,
            bairro, localidade, uf, numero, senha: senhaHash,
            eAdmin: 0 // Nunca aceitar nível de acesso enviado pelo formulário.
        })
        req.flash('success_msg', 'Cadastro realizado com sucesso!')
        res.redirect('/usuarios/login')
    } catch (erro) {
        console.error(erro)
        req.flash('error_msg', 'Não foi possível criar sua conta.')
        res.redirect('/usuarios/registro')
    }
})

router.get('/login', (req, res) => res.render('login'))
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (erro, usuario) => {
        if (erro) return next(erro)
        if (!usuario) {
            req.flash('error_msg', 'Email ou senha incorretos.')
            return res.redirect('/usuarios/login')
        }
        req.logIn(usuario, erroLogin => {
            if (erroLogin) return next(erroLogin)
            return res.redirect(usuario.eAdmin === 1 ? '/admin' : '/livros')
        })
    })(req, res, next)
})

router.post('/logout', (req, res, next) => {
    req.logout(erro => {
        if (erro) return next(erro)
        req.session.destroy(() => res.redirect('/livros'))
    })
})
// Mantém compatibilidade com links antigos do projeto.
router.get('/logout', (req, res, next) => {
    req.logout(erro => {
        if (erro) return next(erro)
        req.session.destroy(() => res.redirect('/livros'))
    })
})

router.get('/conta', eUser, (req, res) => res.render('usuarios/conta', { user: req.user.toObject() }))

router.post('/conta/edit', eUser, async (req, res) => {
    try {
        const { nome, email, cep, logradouro, complemento, bairro, localidade, uf, numero } = req.body
        const emailNormalizado = String(email || '').toLowerCase().trim()
        const conflito = await Usuario.findOne({ email: emailNormalizado, _id: { $ne: req.user._id } })
        if (conflito) {
            req.flash('error_msg', 'Este e-mail já está sendo utilizado.')
            return res.redirect('/usuarios/conta')
        }
        await Usuario.findByIdAndUpdate(req.user._id, {
            nome, email: emailNormalizado, cep, logradouro, complemento, bairro, localidade, uf, numero
        }, { runValidators: true })
        req.flash('success_msg', 'Conta atualizada com sucesso!')
        res.redirect('/usuarios/conta')
    } catch (erro) {
        console.error(erro)
        req.flash('error_msg', 'Não foi possível atualizar sua conta.')
        res.redirect('/usuarios/conta')
    }
})

module.exports = router
