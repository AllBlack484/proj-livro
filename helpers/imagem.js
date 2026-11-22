const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

// Confere o formato e o tamanho da capa recebida e salva em public/uploads.
function salvarImagem(imagem) {
    if (!imagem || typeof imagem !== 'string') throw new Error('Selecione uma imagem.')
    const partes = imagem.match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/)
    if (!partes) throw new Error('Use uma imagem JPG, PNG ou WebP.')
    const dados = Buffer.from(partes[2], 'base64')
    if (dados.length === 0 || dados.length > 2 * 1024 * 1024) throw new Error('A imagem deve ter até 2 MB.')
    const tipo = partes[1]
    const valida = tipo === 'png'
        ? dados.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
        : tipo === 'jpeg'
            ? dados[0] === 255 && dados[1] === 216 && dados[2] === 255
            : dados.toString('ascii', 0, 4) === 'RIFF' && dados.toString('ascii', 8, 12) === 'WEBP'
    if (!valida) throw new Error('O arquivo não é uma imagem válida.')
    const pasta = path.join(__dirname, '..', 'public', 'uploads')
    fs.mkdirSync(pasta, { recursive: true })
    const extensao = tipo === 'jpeg' ? 'jpg' : tipo
    const nome = crypto.randomUUID() + '.' + extensao
    fs.writeFileSync(path.join(pasta, nome), dados)
    return '/uploads/' + nome
}

// Remove a capa salva quando ela é substituída ou a resenha é excluída.
function excluirImagem(caminho) {
    if (typeof caminho !== 'string' || !/^\/uploads\/[a-f0-9-]+\.(jpg|png|webp)$/.test(caminho)) return
    try { fs.unlinkSync(path.join(__dirname, '..', 'public', 'uploads', path.basename(caminho))) }
    catch (erro) { if (erro.code !== 'ENOENT') console.error('Erro ao excluir imagem:', erro) }
}

module.exports = { salvarImagem, excluirImagem }
