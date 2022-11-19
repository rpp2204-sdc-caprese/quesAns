require('dotenv').config()
const { DB_USER, DB_NAME, PG_PASSWORD } = process.env
const DB_HOST = process.env.DB_HOST || 'localhost'
const { Pool } = require('pg')

const pool = new Pool({
    host: DB_HOST,
    user: DB_USER,
    database: DB_NAME,
    password: PG_PASSWORD,
    max: 25
})

try {
    pool.connect()
} catch (err) {
    console.log(err)
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  queryAwait: async(text, params) => await pool.query(text, params)
  connect: async() => await pool.connect()
}