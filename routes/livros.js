const express = require('express')
const router = express.Router()
const Livro = require('../models/Livro')
const Avaliacao = require('../models/Avaliacao')
const { eUser } = require('../helpers/conta')
const { salvarImagem, excluirImagem } = require('../helpers/imagem')
const mongoose = require('mongoose')

// Mostra a lista pública de livros e calcula a média das avaliações.
router.get('/', async (req, res) => {
    try {
        const livros = await Livro.find().sort({ titulo: 1 }).lean()
        const medias = await Avaliacao.aggregate([
            { $group: { _id: '$livro', media: { $avg: '$estrelas' }, total: { $sum: 1 } } }
        ])
        const mapa = new Map(medias.map(item => [String(item._id), item]))
        const livrosComMedia = livros.map(livro => ({
            ...livro,
            media: mapa.get(String(livro._id)) ? mapa.get(String(livro._id)).media.toFixed(1) : 'Sem avaliações',
            totalAvaliacoes: mapa.get(String(livro._id)) ? mapa.get(String(livro._id)).total : 0,
            meu: req.user && String(livro.usuario) === String(req.user._id)
        }))
        res.render('livros/index', { livros: livrosComMedia })
    } catch (erro) {
        console.error(erro)
        req.flash('error_msg', 'Não foi possível carregar os livros.')
        res.status(500).send('Não foi possível carregar os livros. Confira a conexão com o banco de dados.')
    }
})


// Permite publicar uma resenha com título, capa, comentário e nota.
router.get('/novo', eUser, (req, res) => {
    res.render('livros/form-resenha', { pagina: 'Nova resenha', acao: '/livros/novo' })
})

router.post('/novo', eUser, async (req, res) => {
    let capa
    let livro
    try {
        const titulo = String(req.body.titulo || '').trim()
        const comentario = String(req.body.comentario || '').trim()
        const estrelas = Number(req.body.estrelas)
        if (!titulo || titulo.length > 150 || !comentario || comentario.length > 1000 ||
            !Number.isInteger(estrelas) || estrelas < 1 || estrelas > 5) {
            throw new Error('Preencha título, comentário e nota de 1 a 5 estrelas.')
        }
        capa = salvarImagem(req.body.imagem)
        livro = await Livro.create({ titulo, autor: 'Não informado', capa, usuario: req.user._id })
        await Avaliacao.create({ livro: livro._id, usuario: req.user._id, comentario, estrelas })
        req.flash('success_msg', 'Resenha publicada com sucesso!')
        return res.redirect(`/livros/${livro._id}`)
    } catch (erro) {
        console.error(erro)
        if (livro) await Livro.findByIdAndDelete(livro._id).catch(console.error)
        if (capa) excluirImagem(capa)
        req.flash('error_msg', erro.message || 'Não foi possível cadastrar a resenha.')
        return res.redirect('/livros/novo')
    }
})

// Exibe e salva a edição da resenha apenas para quem a publicou.
router.get('/:id/editar', eUser, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) return res.redirect('/livros')
        const livro = await Livro.findOne({ _id: req.params.id, usuario: req.user._id }).lean()
        if (!livro) throw new Error('Resenha não encontrada ou sem permissão.')
        const avaliacao = await Avaliacao.findOne({ livro: livro._id, usuario: req.user._id }).lean()
        res.render('livros/form-resenha', { pagina: 'Editar resenha', acao: `/livros/${livro._id}/editar`, livro, avaliacao })
    } catch (erro) {
        req.flash('error_msg', erro.message)
        res.redirect('/livros')
    }
})

router.post('/:id/editar', eUser, async (req, res) => {
    let novaCapa
    try {
        if (!mongoose.isValidObjectId(req.params.id)) throw new Error('Identificador inválido.')
        const livro = await Livro.findOne({ _id: req.params.id, usuario: req.user._id })
        if (!livro) throw new Error('Resenha não encontrada ou sem permissão.')
        const titulo = String(req.body.titulo || '').trim()
        const comentario = String(req.body.comentario || '').trim()
        const estrelas = Number(req.body.estrelas)
        if (!titulo || titulo.length > 150 || !comentario || comentario.length > 1000 ||
            !Number.isInteger(estrelas) || estrelas < 1 || estrelas > 5) {
            throw new Error('Preencha título, comentário e nota de 1 a 5 estrelas.')
        }
        if (req.body.imagem) novaCapa = salvarImagem(req.body.imagem)
        const capaAntiga = livro.capa
        livro.titulo = titulo
        if (novaCapa) livro.capa = novaCapa
        await livro.save()
        await Avaliacao.findOneAndUpdate(
            { livro: livro._id, usuario: req.user._id },
            { $set: { comentario, estrelas } }, { upsert: true, runValidators: true }
        )
        if (novaCapa) excluirImagem(capaAntiga)
        req.flash('success_msg', 'Resenha atualizada!')
        res.redirect(`/livros/${livro._id}`)
    } catch (erro) {
        console.error(erro)
        if (novaCapa) excluirImagem(novaCapa)
        req.flash('error_msg', erro.message || 'Não foi possível editar a resenha.')
        res.redirect('/livros')
    }
})

// Exclui a resenha do autor, suas avaliações e a imagem salva.
router.post('/:id/excluir', eUser, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) throw new Error('Identificador inválido.')
        const livro = await Livro.findOne({ _id: req.params.id, usuario: req.user._id })
        if (!livro) throw new Error('Resenha não encontrada ou sem permissão.')
        await Avaliacao.deleteMany({ livro: livro._id })
        await livro.deleteOne()
        excluirImagem(livro.capa)
        req.flash('success_msg', 'Resenha excluída!')
    } catch (erro) {
        console.error(erro)
        req.flash('error_msg', 'Não foi possível excluir a resenha.')
    }
    res.redirect('/livros')
})

// Carrega os detalhes do livro, os comentários e a média de estrelas.
router.get('/:id', async (req, res) => {
    try {
        const livro = await Livro.findById(req.params.id).lean()
        if (!livro) {
            req.flash('error_msg', 'Livro não encontrado.')
            return res.redirect('/livros')
        }
        const avaliacoes = await Avaliacao.find({ livro: livro._id })
            .populate('usuario', 'nome').sort({ createdAt: -1 }).lean()
        const resultado = await Avaliacao.aggregate([
            { $match: { livro: livro._id } },
            { $group: { _id: null, media: { $avg: '$estrelas' }, total: { $sum: 1 } } }
        ])
        const minhaAvaliacao = req.user
            ? await Avaliacao.findOne({ livro: livro._id, usuario: req.user._id }).lean()
            : null
        res.render('livros/detalhe', {
            livro,
            avaliacoes,
            media: resultado.length ? resultado[0].media.toFixed(1) : 'Sem avaliações',
            totalAvaliacoes: resultado.length ? resultado[0].total : 0,
            minhaAvaliacao,
            meu: req.user && String(livro.usuario) === String(req.user._id)
        })
    } catch (erro) {
        console.error(erro)
        req.flash('error_msg', 'Não foi possível abrir este livro.')
        res.redirect('/livros')
    }
})

// Usuários logados podem criar ou atualizar sua avaliação de um livro.
router.post('/:id/avaliar', eUser, async (req, res) => {
    try {
        const livro = await Livro.findById(req.params.id)
        if (!livro) {
            req.flash('error_msg', 'Livro não encontrado.')
            return res.redirect('/livros')
        }
        const estrelas = Number(req.body.estrelas)
        if (!Number.isInteger(estrelas) || estrelas < 1 || estrelas > 5) {
            req.flash('error_msg', 'Escolha uma nota entre 1 e 5 estrelas.')
            return res.redirect(`/livros/${livro._id}`)
        }
        await Avaliacao.findOneAndUpdate(
            { livro: livro._id, usuario: req.user._id },
            { $set: { estrelas, comentario: String(req.body.comentario || '').trim() } },
            { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
        )
        req.flash('success_msg', 'Sua avaliação foi salva!')
        res.redirect(`/livros/${livro._id}`)
    } catch (erro) {
        console.error(erro)
        req.flash('error_msg', 'Não foi possível salvar sua avaliação.')
        res.redirect('/livros')
    }
})

module.exports = router
