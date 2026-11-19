// Converte o arquivo escolhido em texto base64 para o Express receber sem dependências extras.
document.querySelectorAll('form[data-imagem]').forEach(form => {
    form.addEventListener('submit', evento => {
        if (form.dataset.pronto === 'sim') return
        const arquivo = form.querySelector('input[type=file]').files[0]
        if (!arquivo) return // Edição sem imagem nova.
        evento.preventDefault()
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(arquivo.type) || arquivo.size > 2 * 1024 * 1024) {
            alert('Escolha uma imagem JPG, PNG ou WebP de até 2 MB.')
            return
        }
        const leitor = new FileReader()
        leitor.onload = () => {
            form.querySelector('input[name=imagem]').value = leitor.result
            form.dataset.pronto = 'sim'
            form.requestSubmit()
        }
        leitor.onerror = () => alert('Não foi possível ler a imagem.')
        leitor.readAsDataURL(arquivo)
    })
})
