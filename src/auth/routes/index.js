const express = require('express')
const base64 = require('js-base64')
const { User } = require('../models')

const authRoutes = express()

const signup = async (req, res, next) => {
    const { username, password } = req.body
    await User.createWithHashed(username, password)
    res.send(201)
}

const signin = async (req, res, next) => {
    let authorization = req.header('Authorization')
    if (!authorization.startsWith('Basic ')) {
        next(new Error('Invalid authorization scheme'))
        return
    }
    authorization = base64.decode(authorization.replace('Basic ', ''))

    console.log('Basic authorization request', authorization)

    const [username, password] = authorization.split(':')
    let user = await User.findLoggedIn(username, password)
    if (user) {
        res.status(200).send({ username: user.username })
    } else {
        next(new Error('Invalid login'))
    }
}
authRoutes.use(express.json())
authRoutes.post('/signup', signup)
authRoutes.post('/signin', signin)

module.exports = { authRoutes }
