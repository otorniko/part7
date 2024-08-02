const bcrypt = require("bcrypt")
const usersRouter = require("express").Router()
const User = require("../models/user")
const e = require("express")

usersRouter.post("/", async (request, response) => {
    const body = request.body
    const { username, name, password } = request.body

    if (!username ) {
        return response.status(400).send({ error: "username missing" })
    } else if( username.length < 3) {
        return response.status(400).send({ error: "username must be at least 3 characters long" })
    }
    if (!password) {
        return response.status(400).send({ error: "password missing" })
    } else if (password.length < 3) {
        return response.status(400).send({ error: "password must be at least 3 characters long" })
    }
    if (!name) {
        return response.status(400).send({ error: "name missing" })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
        username,
        name,
        password,
        passwordHash,
    })

    const savedUser = await user.save()

    response.status(201).json(savedUser)
})

usersRouter.get("/", async (request, response) => {
    const users = await User.find({}).populate("blogs", { title: 1, author: 1 })
    response.json(users)
})

module.exports = usersRouter
