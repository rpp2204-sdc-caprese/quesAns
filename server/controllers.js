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
pool.connect()


const getQuestions = async(req, res) => {

  let product_id = req.query.product_id
  let count = req.query.count || 5
  let page = req.query.page || 1

  if(product_id === undefined || parseInt(product_id) < 0 || product_id.length === 0) {
    return res.status(404).send('MUST HAVE VALID PRODUCT ID')
  }

  let response = {
    product_id: product_id,
    results: []
  }
  let offset = (page - 1) * count
  let queryText = `select id, body, date_written, asker_name, helpful, reported from questions where product_id = $1 and reported = false limit $2 offset $3`
  let query = {
    text: queryText,
    values: [product_id, count, offset]
   }

  return pool.query(query)
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
        let query = {
          text: 'select id, body, date_written, answerer_name, reported, helpful from answers where question_id = $1 and reported = false',
          values: [question_id]
        }
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
          let query = {
            text: 'select url from answers_photos where answer_id = $1',
            values: [res.rows[j].id],
          }
          let photos_urls = await pool.query(query)
          photos_urls = photos_urls.rows.map(photo => photo.url)
          response.results[i].answers[res.rows[j].id].photos = photos_urls
        }
      }
      return response
    })
    .then(results => {
      console.log(results)
      if(results === undefined) {
        throw new Error('Server Error')
        return;
      }
      res.status(200).send(results)
    })
    .catch(err => {
      console.log(err)
      res.status(500).send(err)
    })
}

const getAnswers = async (req, res) => {

  let question_id = req.params.question_id
  let count = req.query.count || 5
  let page = req.query.page || 1

  if(question_id === undefined || parseInt(question_id) < 0 || question_id.length === 0) {
    return res.status(404).send('MUST HAVE VALID QUESTION ID')
  }

  let response = {
    question: question_id,
    page: page,
    count: count,
    results: []
  }
  let offset = (page - 1) * count

  let query = {
    text: `select id as answer_id, body, date_written as date, answerer_name, helpful as helpfulness from answers where question_id = $1 and reported = false limit $2 offset $3`,
    values: [question_id, count, offset]
  }

  return pool.query(query)
    .then(async(results) => {
      response.results = results.rows
      for(let i = 0; i < response.results.length; i++) {
        let query = {
          text: 'select id, url from answers_photos where answer_id = $1',
          values: [response.results[i].answer_id]
        }
        let photos_urls = await pool.query(query)
        response.results[i].photos = photos_urls.rows
      }
      return response
    })
    .then(response => {
      res.status(200).send(response)
    })
    .catch(err => {
      res.status(500).send(err)
    })

}

const postQuestion = async (question) => {
  let product_id = parseInt(question.product_id)
  let body = question.body
  let date_written = new Date().toISOString();
  let asker_name = question.name
  let asker_email = question.email
  let reported = false;
  let helpful = 0;

  let query = {
    text: `insert into questions(product_id, body, date_written, asker_name, asker_email, reported, helpful) values($1, $2, $3, $4, $5, $6, $7)`,
    values: [product_id, body, date_written, asker_name, asker_email, reported, helpful]
  }

  return pool.query(query)
    .then(results => {
      return results
    })
    .catch(err => {
      console.log(err)
    })
}

const postAnswer = (question_id, answer) => {
  let body = answer.body
  let date_written = new Date().toISOString()
  let name = answer.name
  let email = answer.email
  let photos = answer.rawPhotos
  let reported = false
  let helpful = 0
  console.log(body, name, email, photos)

  let answerQuery = {
    text: 'insert into answers(question_id, body, date_written, answerer_name, answerer_email, reported, helpful) values($1, $2, $3, $4, $5, $6, $7) returning id',
    values: [question_id, body, date_written, name, email, reported, helpful]
  }

  return pool.query(answerQuery)
    .then(results => {
      let answer_id = results.rows[0].id
      return answer_id
    })
    .then(answer_id => {
      let photoQueries = []
      for(let i = 0; i < photos.length; i++) {
        let photoQuery = {
          text: 'insert into answers_photos(answer_id, url) values($1, $2)',
          values: [answer_id, photos[i]]
        }
        photoQueries.push(pool.query(photoQuery))
      }

      return Promise.all(photoQueries)
        .then(results => {
          console.log('AFTER PROMISE ALL: ', results)
          return results
        })
        .catch(err => {
          console.log(err)
        })
    })
    .catch(err => {
      console.log(err)
    })
}

const updateQuestionHelpfulness = question_id => {

  let query = {
    text: 'update questions set helpful = helpful + 1 where id = $1',
    values: [question_id]
  }

  return pool.query(query)
    .then(results => {
      return results
    })
    .catch(err => {
      console.log(err)
    })
}

const reportQuestion = question_id => {

  let query = {
    text: 'update questions set reported = true where id = $1',
    values: [question_id]
  }

  return pool.query(query)
    .then(results => {
      return results
    })
    .catch(err => {
      console.log(err)
    })
}

const updateAnswerHelpfulness = answer_id => {

  let query = {
    text: 'update answers set helpful = helpful + 1 where id = $1',
    values: [answer_id]
  }

  return pool.query(query)
    .then(results => {
      return results
    })
    .catch(err => {
      console.log(err)
    })
}

const reportAnswer = answer_id => {

  let query = {
    text: 'update answers set reported = true where id = $1',
    values: [answer_id]
  }

  return pool.query(query)
    .then(results => {
      return results
    })
    .catch(err => {
      console.log(err)
    })
}

module.exports = {
  getQuestions,
  getAnswers,
  postQuestion,
  postAnswer,
  updateQuestionHelpfulness,
  reportQuestion,
  updateAnswerHelpfulness,
  reportAnswer
}