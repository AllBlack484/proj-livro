// Controla quem pode entrar nas rotas: apenas administradores ou usuários logados.
module.exports = {
    eAdmin: function (req, res, next) {
        if (req.isAuthenticated() && req.user.eAdmin === 1) return next()
        req.flash('error_msg', 'Acesso permitido somente para administradores.')
        return res.redirect('/usuarios/login')
    },
    eUser: function (req, res, next) {
        if (req.isAuthenticated()) return next()
        req.flash('error_msg', 'Faça login para continuar.')
        return res.redirect('/usuarios/login')
    }
}
