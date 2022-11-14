const {
  handleGetResponse,
  handlePostResponse,
  handlePutResponse,
  handleClientError,
  handleError,
  idIsInvalid
} = require('./resHelpers.js')

const {
  SELECT_QUESTIONS_ANSWERS_TEXT,
  SELECT_PHOTOS_TEXT,
  INSERT_QUESTION_TEXT,
  UPDATE_QUESTION_HELPFULNESS_TEXT,
  UPDATE_QUESTION_REPORTED_TEXT
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
    // let redisQuestionKey = `product_id=${product_id}&count=${count}&page=${page}`
    // const cache = await getCache(redisQuestionKey)
    // if(!!cache) {
    //   handleGetResponse(res, JSON.parse(cache))
    // } else {

      let response = {
        product_id: product_id,
        results: []
      }

      let offset = (page - 1) * count
      const SELECT_QUESTION_ANSWERS = {
        text: SELECT_QUESTIONS_ANSWERS_TEXT,
        values: [product_id, count, offset]
      }

      const questions = await client.query(SELECT_QUESTION_ANSWERS)
      response.results = questions.rows
      for(let i = 0; i < response.results.length; i++) {
        for(let answer_id in response.results[i].answers) {
          const SELECT_PHOTOS = {
            text: SELECT_PHOTOS_TEXT,
            values: [answer_id]
          }
          let photo_urls = await client.query(SELECT_PHOTOS)
          response.results[i].answers[answer_id].photos = photo_urls.rows[0].photos
        }
      }
      // await setCache(redisQuestionKey, JSON.stringify(response))
      handleGetResponse(res, response)
    // }
  } catch(err) {
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

  if(idIsInvalid(product_id)) return handleClientError(res, 'MUST HAVE VALID PRODUCT ID')

  const INSERT_QUESTION = {
    text: INSERT_QUESTION_TEXT,
    values: [product_id, body, date_written, asker_name, asker_email, reported, helpful]
  }

  pool
    .query(INSERT_QUESTION)
    .then(results => handlePostResponse(res))
    .catch(err => handleClientError(res, err))
}


const updateQuestionHelpfulness = (req, res) => {
  let question_id = req.params.question_id
  if(idIsInvalid(question_id)) return handleClientError(res, 'MUST HAVE VALID QUESTION ID')
  const UPDATE_QUESTION_HELPFULNESS = {
    text: UPDATE_QUESTION_HELPFULNESS_TEXT,
    values: [question_id]
  }
  pool
    .query(UPDATE_QUESTION_HELPFULNESS)
    .then(() => handlePutResponse(res))
    .catch(err => handleError(res, err))
}


const reportQuestion = (req, res) => {
  let question_id = req.params.question_id
  if(idIsInvalid(question_id)) return handleClientError(res, 'MUST HAVE VALID QUESTION ID')
  const UPDATE_QUESTION_REPORTED = {
    text: UPDATE_QUESTION_REPORTED_TEXT,
    values: [question_id]
  }
  pool
    .query(UPDATE_QUESTION_REPORTED)
    .then(() => handlePutResponse(res))
    .catch(err => handleError(res, err))
}


module.exports = {
  getQuestions,
  postQuestion,
  updateQuestionHelpfulness,
  reportQuestion
}