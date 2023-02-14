const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')

const User = require('./../models/User.model')

const { isLoggedOut } = require('../middleware/route-guard')

const saltRounds = 10

router.get('/registro', isLoggedOut, (req, res) => {
    res.render('auth/signup-form')
})

router.post('/registro', (req, res) => {
    const { username, userPassword } = req.body

    bcrypt
        .genSalt(saltRounds)
        .then(salt => bcrypt.hash(userPassword, salt))
        .then(passwordHash => User.create({ username, password: passwordHash }))
        .then(user => res.redirect('/'))
        .catch(err => console.log(err))
})

router.get('/inicio-sesion', isLoggedOut, (req, res) => {
    res.render('auth/login-form')
})

router.post('/inicio-sesion', (req, res) => {
    const { username, userPassword } = req.body

    if (username.length === 0 || userPassword === 0) {
        res.render('auth/login-form', { errorMessage: 'Falta rellenar los campos' })
        return
    }

    User
        .findOne({ username })
        .then(user => {
            if (!user) {
                res.render('auth/login-form', { errorMessage: 'Usuario no registrado' })
            }
            else if (!bcrypt.compareSync(userPassword, user.password)) {
                res.render('auth/login-form', { errorMessage: 'Datos incorrectos' })
            }
            // iniciar sesion
            else {
                req.session.currentUser = user
                res.redirect('/')
            }

        })
})
//cerrar sesion
router.get('/cerrar-sesion', (req, res) => {
    req.session.destroy(() => res.redirect('/'))
})


module.exports = router