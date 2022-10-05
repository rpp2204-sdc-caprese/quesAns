const { Pool } = require('pg')

const db = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'sdc',
  password: ''
})

await db.connect()


module.exports = {
  db
}