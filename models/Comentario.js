const mongoose = require('mongoose')
const Schema = mongoose.Schema

// Criando a estrutura da coleção do mongo - Comentario
const Livro = new Schema({
    nome: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    texto: {
        type: String,
        required: true
    }
},

//Pegando a data e a hora do envio do comentário
{timestamps: true}

)

// Exportar a coleção para outros arquivos
mongoose.model('livros', Livro)