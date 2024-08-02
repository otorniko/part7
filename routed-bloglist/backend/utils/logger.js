const config = require("../utils/config")

const info = (...params) => config.NODE_ENV !== "test" && console.log(...params)
const error = (...params) => config.NODE_ENV !== "test" && console.error(...params)

module.exports = { info, error }
