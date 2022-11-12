const {
  handleGetResponse,
  handlePostResponse,
  handlePutResponse,
  handleClientError,
  handleError
} = require('./resHelpers.js')

const {
  SELECT_ANSWERS,
  INSERT_ANSWERS,
  INSERT_PHOTOS,
  UPDATE_ANSWERS_HELPFULNESS,
  UPDATE_ANSWERS_REPORTED
} = require('./queries/queriesAnswers.js')

const pool = require('../../database/db.js')
//const redisClient = require('../../database/redis.js')

const getAnswers = async (req, res) => {

  let question_id = req.params.question_id
  let count = req.query.count || 5
  let page = req.query.page || 1

  if(question_id === undefined || parseInt(question_id) < 0 || question_id.length === 0) {
    return handleClientError(res, 'MUST HAVE VALID PRODUCT ID')
  }

  try {
    const cache = await redisClient.get(`question_id=${question_id}&count=${count}&page=${page}`)
    if(cache) {
      handleGetResponse(res, JSON.parse(cache))
    } else {
      let queryText = SELECT_ANSWERS
      let offset = (page - 1) * count
      let query = {
        text: queryText,
        values: [question_id, count, offset]
      }

      pool
        .query(query)
        .then(async(results) => {
          let response = {
            question: question_id,
            page: page,
            count: count,
          }
          response.results = results.rows
//          await redisClient.set(`question_id=${question_id}&count=${count}&page=${page}`, JSON.stringify(response))
          handleGetResponse(res, response)
        })
        .catch(err => {
          handleError(res, err)
        })
    }
  } catch(err) {
    handleError(res, err)
  }
}


const postAnswer = (req, res) => {

  let question_id = parseInt(req.params.question_id)

  let answer;
  if(typeof req.body.data !== 'object') {
    answer = JSON.parse(req.body.data)
  } else {
    answer = req.body.data
  }

  let body = answer.body
  let date_written = new Date().toISOString()
  let name = answer.name
  let email = answer.email
  let photos = answer.rawPhotos
  let reported = false
  let helpful = 0
  console.log(body, name, email, photos)

  let answerQuery = {
    text: INSERT_ANSWERS,
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
          text: INSERT_PHOTOS,
          values: [answer_id, photos[i]]
        }
        photoQueries.push(pool.query(photoQuery))
      }

      return Promise.all(photoQueries)
    })
    .then(results => {
      console.log('AFTER PROMISE ALL: ', results)
      handlePostResponse(res, results)
    })
    .catch(err => {
      handleError(res, err)
    })
}


const updateAnswerHelpfulness = (req, res) => {
  let answer_id = req.params.answer_id
  let query = {
    text: UPDATE_ANSWERS_HELPFULNESS,
    values: [answer_id]
  }
  pool
    .query(query)
    .then(() => handlePutResponse(res))
    .catch(err => handleError(res, err))
}


const reportAnswer = (req, res) => {
  let answer_id = req.params.answer_id
  let query = {
    text: UPDATE_ANSWERS_REPORTED,
    values: [answer_id]
  }
  pool
    .query(query)
    .then(() => handlePutResponse(res))
    .catch(err => handleError(res, err))
}


module.exports = {
  getAnswers,
  postAnswer,
  updateAnswerHelpfulness,
  reportAnswer
}