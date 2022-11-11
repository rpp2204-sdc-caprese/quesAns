const {
  handleGetResponse,
  handlePostResponse,
  handlePutResponse,
  handleClientError,
  handleError
} = require('./resHelpers.js')

const pool = require('../../database/db.js')
//const redisClient = require('../../database/redis.js')

const getQuestions = async(req, res) => {

  let product_id = req.query.product_id
  let count = req.query.count || 5
  let page = req.query.page || 1


  if(product_id === undefined || parseInt(product_id) < 0 || product_id.length === 0) {
    return handleClientError(res, 'MUST HAVE VALID PRODUCT ID')
  }

  // try {
  //   const cache = await redisClient.get(`product_id=${product_id}&count=${count}&page=${page}`)
  //   if(cache) {
  //     handleGetResponse(res, JSON.parse(cache))
  //   } else {

      let response = {
        product_id: product_id,
        results: []
      }

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

      let offset = (page - 1) * count
      let query = {
        name: 'getQuestionsAnswers',
        text: queryText,
        values: [product_id, count, offset]
      }

      pool
        .query(query)
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
        .then(async(results) => {
          if(results === undefined) {
            throw new Error('Server Error')
            return;
          }
//          await redisClient.set(`product_id=${product_id}&count=${count}&page=${page}`, JSON.stringify(results))
          handleGetResponse(res, results)
        })
        .catch(err => {
          handleError(res, err)
        })
  //   }
  // } catch(err) {
  //   handleError(res, err)
  // }
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

  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    let query = {
      text: `insert into questions(product_id, body, date_written, asker_name, asker_email, reported, helpful) values($1, $2, $3, $4, $5, $6, $7)`,
      values: [product_id, body, date_written, asker_name, asker_email, reported, helpful]
    }
    let results = await client.query(query)
    await client.query('COMMIT')
    handlePostResponse(res, JSON.stringify(results.rowCount))
  } catch(err) {
    await client.query('ROLLBACK')
    handleError(res, err)
  } finally {
    client.release()
  }

}

const updateQuestionHelpfulness = async(req, res) => {
  let question_id = req.params.question_id
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    let query = {
      text: 'update questions set helpful = helpful + 1 where id = $1',
      values: [question_id]
    }
    let results = await client.query(query)
    await client.query('COMMIT')
    handlePutResponse(res)
  } catch(err) {
    await client.query('ROLLBACK')
    handleError(res, err)
  } finally {
    client.release()
  }

}

const reportQuestion = async(req, res) => {
  let question_id = req.params.question_id

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    let query = {
      text: 'update questions set reported = true where id = $1',
      values: [question_id]
    }
    let results = await client.query(query)
    await client.query('COMMIT')
    handlePutResponse(res)
  } catch(err) {
    await client.query('ROLLBACK')
    handleError(res, err)
  } finally {
    client.release()
  }
}

module.exports = {
  getQuestions,
  postQuestion,
  updateQuestionHelpfulness,
  reportQuestion
}