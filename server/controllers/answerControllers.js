const Answer = require('../../models/Answer.js')
const { handleGetResponse, handlePostResponse, handlePutResponse, handleClientError, handleError } = require('./helpers/resHelpers.js')
const { idIsInvalid , getInvalidIdMessage } = require('./helpers/idHelpers.js')
const { getCache, setCache, CheckRedis } = require('../../database/redisHelpers.js')
const INVALID_ID_MESSAGE = getInvalidIdMessage()

const getAnswers = async (req, res) => {
  let question_id = parseInt(req.params.question_id)
  let count = req.query.count || 5
  let page = req.query.page || 1
  let offset = (page - 1) * count

  let response = {
    question: question_id,
    page: page,
    count: count,
  }

  if(idIsInvalid(question_id)) return handleClientError(res, INVALID_ID_MESSAGE)

  try {
    if(CheckRedis.isReady()) {
      let redisAnswerKey = `question_id=${question_id}&count=${count}&page=${page}`;
      const cache = await getCache(redisAnswerKey)
      if(!!cache) {
        handleGetResponse(res, JSON.parse(cache))
      } else /*RESULT IS NOT CACHED*/ {
        Answer.get(question_id, count, offset)
          .then(async(results) => {
            response.results = results.rows
            setCache(redisAnswerKey, response)
            handleGetResponse(res, response)
          })
          .catch(err => {
            handleError(res, err)
          })
      }
    } else /*REDIS IS NOT CONNECTED*/ {
      Answer.get(question_id, count, offset)
      .then(async(results) => {
        response.results = results.rows
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
  let { body, name, email, rawPhotos } = req.body.data //Data from answer POST is in data property of req.body
  let date_written = new Date().toISOString()
  let reported = false
  let helpful = 0

  if(idIsInvalid(question_id)) return handleClientError(res, INVALID_ID_MESSAGE)

  try {
    let values = [question_id, body, date_written, name, email, reported, helpful]
    await Answer.create(values, rawPhotos)
    handlePostResponse(res)
  } catch(err) {
    handleError(res, err)
  }
}


const updateAnswerHelpfulness = (req, res) => {
  let answer_id = parseInt(req.params.answer_id)
  if(idIsInvalid(answer_id)) return handleClientError(res, INVALID_ID_MESSAGE)
  Answer.updateHelpfulness(answer_id)
    .then(() => handlePutResponse(res))
    .catch(err => handleError(res, err))
}


const reportAnswer = (req, res) => {
  let answer_id = parseInt(req.params.answer_id)
  if(idIsInvalid(answer_id)) return handleClientError(res, INVALID_ID_MESSAGE)
  Answer.updateReported(answer_id)
    .then(() => handlePutResponse(res))
    .catch(err => handleError(res, err))
}


module.exports = {
  getAnswers,
  postAnswer,
  updateAnswerHelpfulness,
  reportAnswer
}