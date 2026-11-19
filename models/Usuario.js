const mongoose = require('mongoose')

const UsuarioSchema = new mongoose.Schema({
    nome: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    cep: { type: String, required: true, trim: true },
    logradouro: { type: String, required: true, trim: true },
    complemento: { type: String, default: '', trim: true },
    bairro: { type: String, required: true, trim: true },
    localidade: { type: String, required: true, trim: true },
    uf: { type: String, required: true, trim: true },
    numero: { type: String, required: true, trim: true },
    // 0 = usuário comum; 1 = administrador. O cadastro público sempre cria usuário comum.
    eAdmin: { type: Number, enum: [0, 1], default: 0 },
    senha: { type: String, required: true }
}, { timestamps: true })

module.exports = mongoose.models.usuarios || mongoose.model('usuarios', UsuarioSchema)
