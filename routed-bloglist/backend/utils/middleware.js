const logger = require("./logger")
const jwt = require("jsonwebtoken")
const User = require("../models/user")

const requestLogger = (request, response, next) => {
    logger.info("Method:", request.method)
    logger.info("Path:  ", request.path)
    logger.info("Body:  ", request.body)
    logger.info("---")
    next()
}

const tokenExtractor = (request, response, next) => {
    const getTokenFrom = (request) => {
        const authorization = request.get("authorization")
        if (authorization && authorization.startsWith("Bearer ")) {
            return authorization.replace("Bearer ", "")
        }
        return null
    }
    const token = getTokenFrom(request)
    request.token = token
    next()
}
const userExtractor = async (request, response, next) => {
    const token = request.token
    if (request.method === "POST" || request.method === "DELETE" || request.method === 'PUT') {
        const decodedToken = jwt.verify(token, process.env.SECRET)
        const user = await User.findById(decodedToken.id)
        if (
            !user &&
            (request.method === "POST" || request.method === "DELETE" || request.method === "PUT")
        ) {
            return response.status(401).json({ error: "Token not found" })
        }
        request.user = user
    }
    next()
}

const unknownEndpoint = (request, response) => {
    response.status(404).json({ error: "unknown endpoint" })
}

const errorHandler = (error, request, response, next) => {
    logger.error(error.message)
    if (error.name === "CastError") {
        return response.status(400).json({ error: "invalid data" })
    } else if (error.name === "ValidationError") {
        return response.status(400).json({ error: error.message })
    } else if (error.name === "JsonWebTokenError") {
        return response.status(401).json({ error: error.message })
    } else if (
        error.name === "MongoServerError" &&
        error.message.includes("E11000 duplicate key error")
    ) {
        return response.status(400).json({ error: "expected `username` to be unique" })
    }
    next(error)
}

module.exports = {
    requestLogger,
    tokenExtractor,
    userExtractor,
    unknownEndpoint,
    errorHandler,
}
