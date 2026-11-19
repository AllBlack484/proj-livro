const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const Livro = require('../models/Livro')
const Avaliacao = require('../models/Avaliacao')
const { eAdmin } = require('../helpers/conta')

router.use(eAdmin)

router.get('/', (req, res) => res.render('admin/index'))

router.get('/livros', async (req, res) => {
    try {
        const livros = await Livro.find().sort({ titulo: 1 }).lean()
        res.render('admin/livros', { livros })
    } catch (erro) {
        console.error(erro)
        req.flash('error_msg', 'Erro ao listar livros.')
        res.redirect('/admin')
    }
})

router.get('/livros/novo', (req, res) => res.render('admin/form-livro', { pagina: 'Cadastrar livro', acao: '/admin/livros/novo' }))

router.post('/livros/novo', async (req, res) => {
    try {
        const { titulo, autor, descricao, capa, genero } = req.body
        if (!titulo || !autor) {
            req.flash('error_msg', 'Título e autor são obrigatórios.')
            return res.redirect('/admin/livros/novo')
        }
        await Livro.create({ titulo, autor, descricao, capa, genero })
        req.flash('success_msg', 'Livro cadastrado com sucesso!')
        res.redirect('/admin/livros')
    } catch (erro) {
        console.error(erro)
        req.flash('error_msg', 'Não foi possível cadastrar o livro.')
        res.redirect('/admin/livros/novo')
    }
})

router.get('/livros/editar/:id', async (req, res) => {
    try {
        const livro = await Livro.findById(req.params.id).lean()
        if (!livro) {
            req.flash('error_msg', 'Livro não encontrado.')
            return res.redirect('/admin/livros')
        }
        res.render('admin/form-livro', { pagina: 'Editar livro', acao: `/admin/livros/editar/${livro._id}`, livro })
    } catch (erro) {
        req.flash('error_msg', 'Identificador de livro inválido.')
        res.redirect('/admin/livros')
    }
})

router.post('/livros/editar/:id', async (req, res) => {
    try {
        const { titulo, autor, descricao, capa, genero } = req.body
        const livro = await Livro.findByIdAndUpdate(req.params.id,
            { titulo, autor, descricao, capa, genero }, { new: true, runValidators: true })
        if (!livro) {
            req.flash('error_msg', 'Livro não encontrado.')
            return res.redirect('/admin/livros')
        }
        req.flash('success_msg', 'Livro atualizado com sucesso!')
        res.redirect('/admin/livros')
    } catch (erro) {
        console.error(erro)
        req.flash('error_msg', 'Não foi possível atualizar o livro.')
        res.redirect('/admin/livros')
    }
})

router.post('/livros/excluir/:id', async (req, res) => {
    try {
        const livro = await Livro.findByIdAndDelete(req.params.id)
        if (!livro) {
            req.flash('error_msg', 'Livro não encontrado.')
            return res.redirect('/admin/livros')
        }
        await Avaliacao.deleteMany({ livro: livro._id })
        req.flash('success_msg', 'Livro e suas avaliações foram excluídos.')
        res.redirect('/admin/livros')
    } catch (erro) {
        console.error(erro)
        req.flash('error_msg', 'Não foi possível excluir o livro.')
        res.redirect('/admin/livros')
    }
})

router.get('/avaliacoes', async (req, res) => {
    try {
        const avaliacoes = await Avaliacao.find()
            .populate('livro', 'titulo').populate('usuario', 'nome email')
            .sort({ createdAt: -1 }).lean()
        res.render('admin/avaliacoes', { avaliacoes })
    } catch (erro) {
        console.error(erro)
        req.flash('error_msg', 'Erro ao listar avaliações.')
        res.redirect('/admin')
    }
})

router.post('/avaliacoes/excluir/:id', async (req, res) => {
    try {
        await Avaliacao.findByIdAndDelete(req.params.id)
        req.flash('success_msg', 'Avaliação excluída com sucesso.')
    } catch (erro) {
        req.flash('error_msg', 'Não foi possível excluir a avaliação.')
    }
    res.redirect('/admin/avaliacoes')
})

module.exports = router
