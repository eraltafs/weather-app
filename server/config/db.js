const mongose = require("mongoose")
require("dotenv").config()
mongose.set('strictQuery', false)
const connection = mongose.connect(process.env.mongo_url)


module.exports = {connection}