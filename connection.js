const maria = require('mariadb')
require('dotenv').config()

const pool = maria.createPool({
  socketPath: process.env.socketpath,
  user: process.env.dbUser,
  password: process.env.dbPassword,
  connectionLimit: 10,
  database: process.env.database
})

module.exports = pool
