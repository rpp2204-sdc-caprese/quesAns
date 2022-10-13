require('dotenv').config()
const PASSWORD = process.env.PASSWORD
const { Pool } = require('pg')

let pool;

const db = async () => {
  try {
    pool = new Pool({
      user: 'postgres',
      database: 'sdc',
      password: PASSWORD
    })
    await pool.connect()
    //transformDate();
    //await getQuestions(5000);
    //pool.end()
  } catch (err) {
    console.log(err)
  }
}

db();

// const transformDate = (date) => {
//   //return dateArray.map(date => {
//     return new Date(parseInt(date)).toISOString()
//  // })
// }

//TRANSFORM
//filter out reported questions, WHERE reported = false
//transform ms dates to iso strings, ALTER ....
//dont need to send back asker_email



const transformDate = async() => {
  pool
    //.query('SELECT date_written FROM questions WHERE id < 100')
    .query('ALTER TABLE questions ALTER COLUMN date_written TYPE TIMESTAMP WITH TIME ZONE USING to_timestamp(date_written / 1000)')
    //.query('SELECT * from questions WHERE reported = false LIMIT 10')
    //.query('SELECT to_timestamp(date_written / 1000) FROM questions WHERE product_id = 71701 LIMIT 10')
    .then(res => {
      console.log('RESULTS: ', res.rows)
      //console.log('TYPE: ', typeof res)
      // let transformed = transformDate(res.rows)
      // console.log(transformed)
    })
    .catch(err => {
      console.log(err)
    })

}

const getQuestions = async(product_id) => {
  let response = {
    product_id: product_id,
    results: []
  }

  return pool.query(`select id, body, date_written, asker_name, reported, helpful from questions where product_id = ${product_id} and reported = false;`)
    .then(res => {
      for(let i = 0; i < res.rows.length; i++) {
        let question = {
          question_id: res.rows[i].id,
          question_body: res.rows[i].body,
          question_date: res.rows[i].date_written,
          asker_name: res.rows[i].asker_name,
          question_helpfulness: res.rows[i].helpful,
          reported: res.rows[i].reported,
          answers: {}
        }
        response.results.push(question)
      }
      return response
    })
    .then(async (response) => {
      for(let i = 0; i < response.results.length; i++) {
        let question_id = response.results[i].question_id
        let query = `select id, body, date_written, answerer_name, reported, helpful from answers where question_id = ${question_id} and reported = false`
        let res = await pool.query(query)
        for(let j = 0; j < res.rows.length; j++) {
          response.results[i].answers[res.rows[j].id] = {
            id: res.rows[j].id,
            body: res.rows[j].body,
            date: res.rows[j].date_written,
            answerer_name: res.rows[j].answerer_name,
            helpfulness: res.rows[j].helpful,
            photos: []
          }
        }
      }

      // console.log(response)
      // console.log(response.results[0].answers)
      return response
    })
    //TODO QUERY PHOTOS!!!!!
    // .then(response => {
    //   //query photo url based on answer id
    // })
    .catch(err => {
      console.log(err)
    })


}

const getAnswers = async (question_id, page = 1, count = 5) => {
  let response = {
    question: question_id,
    page: page,
    count: count,
    results: []
  }
  //need to fix how variables are put in query
  let query = `select id as answer_id, body, date_written, answerer_name, helpful from answers where question_id = ${question_id} and reported = false`

  return pool.query(query)
    .then(results => {
      response.results = results.rows
      return response
      //console.log(results.rows)
    })
    .catch(err => {
      console.log(err)
    })

}


module.exports = {
  db,
  getQuestions,
  getAnswers
}