const Answer = require('../../models/Answer.js')
const { handleGetResponse, handlePostResponse, handlePutResponse, handleClientError, handleError } = require('./helpers/resHelpers.js')
const { setCache, isRedisReady } = require('../../database/redisHelpers.js')
let redisIsReady = isRedisReady()


const getAnswers = (req, res) => {
  let { question_id } = req.params
  let count = req.query.count || 5
  let page = req.query.page || 1
  let offset = (page - 1) * count

  Answer
    .getAnswers(question_id, count, offset)
    .then(async(results) => {
      let response = { question: question_id, page, count }
      response.results = results.rows
      if(redisIsReady) {
        let { redisQuestionKey } = req
        await setCache(redisAnswerKey, response)
      }
      handleGetResponse(res, response)
    })
    .catch(err => handleError(res, err))
}


const postAnswer = async(req, res) => {
  let { question_id } = req.params
  let { body, name, email, rawPhotos } = req.body.data //Data from answer POST is in data property of req.body
  let date_written = new Date().toISOString()
  let reported = false
  let helpful = 0

  try {
    let values = [question_id, body, date_written, name, email, reported, helpful]
    await Answer.addNewAnswer(values, rawPhotos)
    handlePostResponse(res)
  } catch(err) {
    handleError(res, err)
  }
}


const updateAnswerHelpfulness = (req, res) => {
  let { answer_id } = req.params
  Answer
    .markAnswerAsHelpful(answer_id)
    .then(() => handlePutResponse(res))
    .catch(err => handleError(res, err))
}


const reportAnswer = (req, res) => {
  let { answer_id } = req.params
  Answer
    .reportAnswer(answer_id)
    .then(() => handlePutResponse(res))
    .catch(err => handleError(res, err))
}


module.exports = {
  getAnswers,
  postAnswer,
  updateAnswerHelpfulness,
  reportAnswer
}