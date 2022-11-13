const {
  handleGetResponse,
  handlePostResponse,
  handlePutResponse,
  handleClientError,
  handleError,
  idIsInvalid
} = require('./resHelpers.js')

const {
  SELECT_QUESTIONS_ANSWERS,
  SELECT_PHOTOS,
  INSERT_QUESTION,
  UPDATE_QUESTION_HELPFULNESS,
  UPDATE_QUESTION_REPORTED
} = require('../../database/queries/queriesQuestions.js')

const { getCache, setCache } = require('../../database/redisHelpers.js')
const pool = require('../../database/db.js')


const getQuestions = async(req, res) => {
  let product_id = req.query.product_id
  let count = req.query.count || 5
  let page = req.query.page || 1

  if(idIsInvalid(product_id)) return handleClientError(res, 'MUST HAVE VALID PRODUCT ID')

  const client = await pool.connect()
  try {
    let redisQuestionKey = `product_id=${product_id}&count=${count}&page=${page}`
    const cache = await getCache(redisQuestionKey)
    if(!!cache) {
      handleGetResponse(res, JSON.parse(cache))
    } else {

      let response = {
        product_id: product_id,
        results: []
      }

      let offset = (page - 1) * count
      let query_selectQuesAns = {
        //name: 'getQuestionsAnswers',
        text: SELECT_QUESTIONS_ANSWERS,
        values: [product_id, count, offset]
      }

      await client.query('BEGIN')
      const questions = await client.query(query_selectQuesAns)
      response.results = questions.rows
      for(let i = 0; i < response.results.length; i++) {
        for(let answer_id in response.results[i].answers) {
          let selectPhotos = {
            text: SELECT_PHOTOS,
            values: [answer_id]
          }
          let photo_urls = await client.query(selectPhotos)
          response.results[i].answers[answer_id].photos = photo_urls.rows[0].photos
        }
      }
      await client.query('COMMIT')
      await setCache(redisQuestionKey, JSON.stringify(response))
      handleGetResponse(res, response)
    }
  } catch(err) {
    await client.query('ROLLBACK')
    handleError(res, err)
  } finally {
    client.release()
  }
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
    text: INSERT_QUESTION,
    values: [product_id, body, date_written, asker_name, asker_email, reported, helpful]
  }

  pool
    .query(query)
    .then(results => handlePostResponse(res))
    .catch(err => handleClientError(res, err))
}


const updateQuestionHelpfulness = (req, res) => {
  let question_id = req.params.question_id
  let query = {
    text: UPDATE_QUESTION_HELPFULNESS,
    values: [question_id]
  }
  pool
    .query(query)
    .then(() => handlePutResponse(res))
    .catch(err => handleError(res, err))
}


const reportQuestion = (req, res) => {
  let question_id = req.params.question_id
  let query = {
    text: UPDATE_QUESTION_REPORTED,
    values: [question_id]
  }
  pool
    .query(query)
    .then(() => handlePutResponse(res))
    .catch(err => handleError(res, err))
}


module.exports = {
  getQuestions,
  postQuestion,
  updateQuestionHelpfulness,
  reportQuestion
}