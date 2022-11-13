const {
  handleGetResponse,
  handlePostResponse,
  handlePutResponse,
  handleClientError,
  handleError
} = require('./resHelpers.js')

const {
  SELECT_ANSWERS,
  INSERT_ANSWER,
  INSERT_PHOTOS,
  UPDATE_ANSWERS_HELPFULNESS,
  UPDATE_ANSWERS_REPORTED
} = require('../../database/queries/queriesAnswers.js')

const { getCache, setCache } = require('../../database/redisHelpers.js')
const pool = require('../../database/db.js')


const getAnswers = async (req, res) => {
  let question_id = req.params.question_id
  let count = req.query.count || 5
  let page = req.query.page || 1

  const questionIdIsInvalid = question_id === undefined || parseInt(question_id) < 0 || question_id.length === 0

  if(questionIdIsInvalid) {
    return handleClientError(res, 'MUST HAVE VALID PRODUCT ID')
  }

  try {
    let redisAnswerKey = `question_id=${question_id}&count=${count}&page=${page}`;
    const cache = await getCache(redisAnswerKey)
    if(!!cache) {
      handleGetResponse(res, JSON.parse(cache))
    } else {
      let offset = (page - 1) * count
      let selectAnswers = {
        text: SELECT_ANSWERS,
        values: [question_id, count, offset]
      }

      pool
        .query(selectAnswers)
        .then(async(results) => {
          let response = {
            question: question_id,
            page: page,
            count: count,
          }
          response.results = results.rows
          await setCache(redisAnswerKey, JSON.stringify(response))
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


const postAnswer = async(req, res) => {
  let question_id = parseInt(req.params.question_id)
  let { body, name, email } = req.body
  let photos = req.body.rawPhotos
  let date_written = new Date().toISOString()
  let reported = false
  let helpful = 0

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    let insertAnswer = {
      text: INSERT_ANSWER,
      values: [question_id, body, date_written, name, email, reported, helpful]
    }
    let result = await client.query(insertAnswer)
    let answer_id = result.rows[0].id
    let photoQueries = []
    for(let i = 0; i < photos.length; i++) {
      let photoQuery = {
        text: INSERT_PHOTOS,
        values: [answer_id, photos[i]]
      }
      photoQueries.push(client.query(photoQuery))
    }

    await Promise.all(photoQueries)
    await client.query('COMMIT')
    handlePostResponse(res)
  } catch(err) {
    await client.query('ROLLBACK')
    console.log(err)
  } finally {
    client.release()
  }
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