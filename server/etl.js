require('dotenv').config()
const PASSWORD = process.env.PASSWORD
const { Pool } = require('pg')

const db = async () => {
  try {
      const pool = new Pool({
        user: 'postgres',
        database: 'sdc',
        password: PASSWORD
      })
    await pool.connect()
    etl(pool);
  } catch (err) {
    console.log(err)
  }
}

db();


const etl = async(pool) => {
  pool
    .query('SELECT * FROM products WHERE id < 100')
    .then(res => {
      console.log('RESULTS: ', res)
      console.log('TYPE: ', typeof res)
    })
    .catch(err => {
      console.log(err)
    })

}


module.exports = {
  db
}