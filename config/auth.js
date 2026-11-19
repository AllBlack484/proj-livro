const LocalStrategy = require('passport-local').Strategy
const Usuario = require('../models/Usuario')
const bcrypt = require('bcryptjs')

module.exports = function (passport) {
    passport.use(new LocalStrategy(
        { usernameField: 'email', passwordField: 'senha' },
        async (email, senha, done) => {
            try {
                const usuario = await Usuario.findOne({ email: String(email).toLowerCase().trim() })
                if (!usuario) return done(null, false, { message: 'Email ou senha incorretos.' })
                const senhaCorreta = await bcrypt.compare(senha, usuario.senha)
                if (!senhaCorreta) return done(null, false, { message: 'Email ou senha incorretos.' })
                return done(null, usuario)
            } catch (erro) {
                return done(erro)
            }
        }
    ))

    passport.serializeUser((usuario, done) => done(null, usuario.id))
    passport.deserializeUser(async (id, done) => {
        try {
            const usuario = await Usuario.findById(id)
            done(null, usuario || false)
        } catch (erro) {
            done(erro)
        }
    })
}
