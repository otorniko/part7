require("express-async-errors")
const cors = require("cors")
const express = require("express")
const mongoose = require("mongoose")

// Internal Modules
const config = require("./utils/config")
const logger = require("./utils/logger")
const {
    requestLogger,
    tokenExtractor,
    userExtractor,
    unknownEndpoint,
    errorHandler,
} = require("./utils/middleware")
const blogsRouter = require("./controllers/blogs")
const usersRouter = require("./controllers/users")
const loginRouter = require("./controllers/login")

// Express App
const app = express()
app.use(express.json())

// MongoDB Connection
mongoose.set("strictQuery", false)
logger.info("connecting to", config.MONGODB_URI)
const connectToMongoDB = async () => {
    await mongoose.connect(config.MONGODB_URI)
    logger.info("connected to MongoDB")
}
connectToMongoDB()

// Middleware
app.use(cors())
app.use(requestLogger)
app.use(tokenExtractor)

// Routes
app.use("/api/blogs", userExtractor, blogsRouter)
app.use("/api/users", usersRouter)
app.use("/api/login", loginRouter)

// Testing route
if (process.env.NODE_ENV === "test") {
    const testingRouter = require("./controllers/testing")
    app.use("/api/testing", testingRouter)
}

// Error Handling Middleware
app.use(unknownEndpoint)
app.use(errorHandler)

module.exports = app

/* 
mongoose
    .connect(config.MONGODB_URI)
    .then(() => {
        logger.info("connected to MongoDB")
    })
    .catch(error => {
        logger.error("error connecting to MongoDB:", error.message)
    }) */
