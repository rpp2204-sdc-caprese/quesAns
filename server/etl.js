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

const transformDate = (dateArray) => {
  return dateArray.map(date => {
    return new Date(parseInt(date.date_written)).toISOString()
  })
}


const etl = async(pool) => {
  pool
    .query('SELECT date_written FROM questions WHERE id < 100')
    .then(res => {
      console.log('RESULTS: ', res.rows)
      //console.log('TYPE: ', typeof res)
      let transformed = transformDate(res.rows)
      console.log(transformed)
    })
    .catch(err => {
      console.log(err)
    })

}


module.exports = {
  db
}