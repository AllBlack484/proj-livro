const mongoose = require('mongoose')

// Guarda mensagens da página de contato; não são as avaliações dos livros. Referente a pagina de contato do site.
const ComentarioSchema = new mongoose.Schema({
    nome: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    texto: { type: String, required: true, trim: true }
}, { timestamps: true })

module.exports = mongoose.models.contatos || mongoose.model('contatos', ComentarioSchema)
