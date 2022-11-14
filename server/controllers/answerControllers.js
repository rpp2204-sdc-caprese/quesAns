const {
  handleGetResponse,
  handlePostResponse,
  handlePutResponse,
  handleClientError,
  handleError,
  idIsInvalid
} = require('./resHelpers.js')

const {
  SELECT_ANSWERS_TEXT,
  INSERT_ANSWER_TEXT,
  INSERT_PHOTOS_TEXT,
  UPDATE_ANSWERS_HELPFULNESS_TEXT,
  UPDATE_ANSWERS_REPORTED_TEXT
} = require('../../database/queries/queriesAnswers.js')

const { getCache, setCache } = require('../../database/redisHelpers.js')
const pool = require('../../database/db.js')


const getAnswers = async (req, res) => {
  let question_id = parseInt(req.params.question_id)
  let count = req.query.count || 5
  let page = req.query.page || 1

  if(idIsInvalid(question_id)) return handleClientError(res, 'MUST HAVE VALID QUESTION ID')

  try {
    let redisAnswerKey = `question_id=${question_id}&count=${count}&page=${page}`;
    const cache = await getCache(redisAnswerKey)
    if(!!cache) {
      handleGetResponse(res, JSON.parse(cache))
    } else {
      let offset = (page - 1) * count
      const SELECT_ANSWERS = {
        text: SELECT_ANSWERS_TEXT,
        values: [question_id, count, offset]
      }

      pool
        .query(SELECT_ANSWERS)
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
  let { body, name, email, rawPhotos } = req.body.data
  let photos = rawPhotos
  let date_written = new Date().toISOString()
  let reported = false
  let helpful = 0

  if(idIsInvalid(question_id)) return handleClientError(res, 'MUST HAVE VALID QUESTION ID')

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const INSERT_ANSWER = {
      text: INSERT_ANSWER_TEXT,
      values: [question_id, body, date_written, name, email, reported, helpful]
    }
    let result = await client.query(INSERT_ANSWER)
    let answer_id = result.rows[0].id
    let photoQueries = []
    for(let i = 0; i < photos.length; i++) {
      const INSERT_PHOTOS = {
        text: INSERT_PHOTOS_TEXT,
        values: [answer_id, photos[i]]
      }
      photoQueries.push(client.query(INSERT_PHOTOS))
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
  if(idIsInvalid(answer_id)) return handleClientError(res, 'MUST HAVE VALID ANSWER ID')
  const UPDATE_ANSWERS_HELPFULNESS = {
    text: UPDATE_ANSWERS_HELPFULNESS_TEXT,
    values: [answer_id]
  }
  pool
    .query(UPDATE_ANSWERS_HELPFULNESS)
    .then(() => handlePutResponse(res))
    .catch(err => handleError(res, err))
}


const reportAnswer = (req, res) => {
  let answer_id = req.params.answer_id
  if(idIsInvalid(answer_id)) return handleClientError(res, 'MUST HAVE VALID ANSWER ID')
  const UPDATE_ANSWERS_REPORTED = {
    text: UPDATE_ANSWERS_REPORTED_TEXT,
    values: [answer_id]
  }
  pool
    .query(UPDATE_ANSWERS_REPORTED)
    .then(() => handlePutResponse(res))
    .catch(err => handleError(res, err))
}


module.exports = {
  getAnswers,
  postAnswer,
  updateAnswerHelpfulness,
  reportAnswer
}