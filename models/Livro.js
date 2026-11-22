const mongoose = require('mongoose')

// Define as informações dos livros, incluindo capa e usuário que publicou.
const LivroSchema = new mongoose.Schema({
    titulo: { type: String, required: true, trim: true },
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'usuarios' },
    autor: { type: String, required: true, trim: true },
    descricao: { type: String, default: '', trim: true },
    capa: { type: String, default: '', trim: true },
    genero: { type: String, default: '', trim: true }
}, { timestamps: true })

module.exports = mongoose.models.livros || mongoose.model('livros', LivroSchema)
