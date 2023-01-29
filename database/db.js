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
  clientQuery: (client, text, params) => client.query(text, params),
  clientBegin: (client, text) => client.query('BEGIN'),
  clientCommit: (client, text) => client.query('COMMIT'),
  clientRollback: (client, text) => client.query('ROLLBACK'),
  clientRelease: (client) => client.release(),
  connect: () => pool.connect()
}