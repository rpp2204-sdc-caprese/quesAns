const Question = require('../../models/Question.js')
const { handleGetResponse, handlePostResponse, handlePutResponse, handleClientError, handleError } = require('./helpers/resHelpers.js')
const { setCache } = require('../../database/redisHelpers.js')


const getQuestions = (req, res) => {
  let { product_id } = req.query
  let count = req.query.count || 5
  let page = req.query.page || 1
  let offset = (page - 1) * count
  let response = { product_id }
  Question
    .getQuestions(product_id, count, offset)
    .then((questions) => {
      response.results = questions.rows
      let { redisQuestionKey } = req
      setCache(redisQuestionKey, response)
      handleGetResponse(res, response)
    })
    .catch((err) => handleError(res, err))
}


const postQuestion = (req, res) => {
  let { product_id, body } = req.body
  let date_written = new Date().toISOString();
  let asker_name = req.body.name
  let asker_email = req.body.email
  let reported = false;
  let helpful = 0;
  Question
    .addNewQuestion([product_id, body, date_written, asker_name, asker_email, reported, helpful])
    .then(()=> handlePostResponse(res))
    .catch(err => handleError(res, err))
}


const updateQuestionHelpfulness = (req, res) => {
  let { question_id } = req.params
  Question
    .markQuestionAsHelpful(question_id)
    .then(() => handlePutResponse(res))
    .catch(err => handleError(res, err))
}


const reportQuestion = (req, res) => {
  let { question_id } = req.params
  Question
    .reportQuestion(question_id)
    .then(() => handlePutResponse(res))
    .catch(err => handleError(res, err))
}


module.exports = {
  getQuestions,
  postQuestion,
  updateQuestionHelpfulness,
  reportQuestion
}