require("dotenv").config()

const PORT = process.env.PORT
const SECRET = process.env.SECRET
const NODE_ENV = process.env.NODE_ENV
const MONGODB_URI = NODE_ENV === "test" 
        ? process.env.MONGODB_TEST_URI 
        : process.env.MONGODB_URI

module.exports = {
    PORT,
    SECRET,
    NODE_ENV,
    MONGODB_URI,
}
