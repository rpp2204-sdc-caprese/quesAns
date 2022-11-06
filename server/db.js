require('dotenv').config()
const PASSWORD = process.env.PASSWORD
const USER = process.env.DB_USER
const DB = process.env.DB_NAME
const { Pool } = require('pg')

const pool = new Pool({
        user: USER,
        database: DB,
        password: PASSWORD
})

try {
    pool.connect()
} catch (err) {
    console.log(err)
}

module.exports = pool