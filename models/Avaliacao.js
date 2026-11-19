const mongoose = require('mongoose')

const AvaliacaoSchema = new mongoose.Schema({
    livro: { type: mongoose.Schema.Types.ObjectId, ref: 'livros', required: true },
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'usuarios', required: true },
    estrelas: { type: Number, required: true, min: 1, max: 5 },
    comentario: { type: String, trim: true, maxlength: 1000, default: '' }
}, { timestamps: true })

// Um usuário pode avaliar cada livro apenas uma vez.
AvaliacaoSchema.index({ livro: 1, usuario: 1 }, { unique: true })

module.exports = mongoose.models.avaliacoes || mongoose.model('avaliacoes', AvaliacaoSchema)
