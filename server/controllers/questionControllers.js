const {
  handleGetResponse,
  handlePostResponse,
  handlePutResponse,
  handleClientError,
  handleError
} = require('./resHelpers.js')

const pool = require('../database/db.js')
const redisClient = require('../database/redis.js')

const getQuestions = async(req, res) => {

  let product_id = req.query.product_id
  let count = req.query.count || 5
  let page = req.query.page || 1

  if(product_id === undefined || parseInt(product_id) < 0 || product_id.length === 0) {
    return handleClientError(res, 'MUST HAVE VALID PRODUCT ID')
  }

  let response = {
    product_id: product_id,
    results: []
  }
  let offset = (page - 1) * count

  let queryText =  `
            SELECT
            q.id AS question_id,
            q.body AS question_body,
            q.date_written AS question_date,
            q.asker_name,
            q.helpful AS question_helpfulness,
            q.reported,
            coalesce(json_object_agg(a.id, json_build_object(
              'id', a.id,
              'body', a.body,
              'date', a.date_written,
              'answerer_name', a.answerer_name,
              'helpfulness', a.helpful
            ))
            filter (where a.id is not null), '{}') as answers
            FROM
              questions q
            LEFT JOIN
              answers a
            ON
              a.question_id = q.id
            AND
              a.reported = FALSE
            WHERE
              q.product_id = $1
            AND
              q.reported = FALSE
            GROUP BY q.id
            ORDER BY
              q.id
            LIMIT
              $2
            OFFSET
              $3`

  let query = {
    text: queryText,
    values: [product_id, count, offset]
   }

  return pool.query(query)
    .then(async(questions) => {
      response.results = questions.rows
       for(let i = 0; i < response.results.length; i++) {
        for(let answer_id in response.results[i].answers) {
          let query = {
            text: `select coalesce(array_agg(url), '{}') as photos from answers_photos where answer_id = $1`,
            values: [answer_id]
          }
          let photo_urls = await pool.query(query)
          response.results[i].answers[answer_id].photos = photo_urls.rows[0].photos
        }
       }
      return response
    })
    .then(results => {
      if(results === undefined) {
        throw new Error('Server Error')
        return;
      }
      handleGetResponse(res, results)
    })
    .catch(err => {
      handleError(res, err)
    })
}


const postQuestion = async (req, res) => {
  let question = req.body;
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
      handlePostResponse(res, results.rowCount)
    })
    .catch(err => {
      handleError(res, err)
    })
}

const updateQuestionHelpfulness = (req, res) => {
  let question_id = req.params.question_id
  let query = {
    text: 'update questions set helpful = helpful + 1 where id = $1',
    values: [question_id]
  }

  return pool.query(query)
    .then(results => {
      handlePutResponse(res, results)
    })
    .catch(err => {
      handleError(res, err)
    })
}

const reportQuestion = (req, res) => {
  let question_id = req.params.question_id
  let query = {
    text: 'update questions set reported = true where id = $1',
    values: [question_id]
  }

  return pool.query(query)
    .then(results => {
      handlePutResponse(res, results)
    })
    .catch(err => {
      handleError(res, err)
    })
}

module.exports = {
  getQuestions,
  postQuestion,
  updateQuestionHelpfulness,
  reportQuestion
}