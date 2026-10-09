const express = require('express');
const router =  express.Router()
const mongoose = require('mongoose')
// Chamando a coleção Comentario.js
require('../models/Livro')
const Livro = mongoose.model('livros')

//Helper para verificar se é admin
const {eAdmin} = require('../helpers/conta')

//rotas ------------------
//pagina principal do admin
router.get('/', eAdmin, function(req, res){
    res.render('admin/index')
})

//listando os comentarios enviados
router.get('/livros', eAdmin, function(req, res){

//buscar um comentario no banco de dados
Livro.find().lean()
.then((livros) =>{
    res.render('admin/livros', {livros})
})
.catch((error)=> {
    req.flash('error_msg', 'erro ao listar livros')
    res.redirect('/admin')
})

})

//pagina de edicção de comentarios
router.get('/livros/edit/:id', eAdmin, function(req, res){
    //encontrando um comentario
    Livro.findOne({_id: req.params.id}).lean()
    .then((livro) => {
        res.render('admin/edit-livro', {livro})
    })
    .catch((error)=> {
        req.flash('error_msg', 'Erro ao carregar livro')
        res.redirect('/admin/livros')
    })
})

//salvando as alterações feitas no comentario
router.post('/livros/edit', eAdmin, function(req, res){

})

// excluindo o comentario
router.post('/livros/delete', eAdmin, function(req, res){

})

module.exports = router