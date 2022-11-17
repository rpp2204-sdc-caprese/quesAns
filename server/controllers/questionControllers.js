const Question = require('../../models/Question.js')
const { handleGetResponse, handlePostResponse, handlePutResponse, handleClientError, handleError, } = require('./helpers/resHelpers.js')
const { idIsInvalid, getInvalidIdMessage } = require('./helpers/idHelpers.js')
const { getCache, setCache, CheckRedis } = require('../../database/redisHelpers.js')
const INVALID_ID_MESSAGE = getInvalidIdMessage()
const redisIsReady = CheckRedis.isReady()


const getQuestions = async(req, res) => {
  let product_id = parseInt(req.query.product_id)
  let count = req.query.count || 5
  let page = req.query.page || 1
  let offset = (page - 1) * count

  let response = {
    product_id: product_id,
    results: []
  }

  console.log(req.redisQuestionKey)

  if(idIsInvalid(product_id)) return handleClientError(res, INVALID_ID_MESSAGE)

  try {
      Question.getQuestions(product_id, count, offset)
        .then(async(results) => {
          response.results = results;
          if(redisIsReady) {
            let { redisQuestionKey } = req
            await setCache(redisQuestionKey, response)
          }
          handleGetResponse(res, response)
        })
        .catch(err => {
          /*TODO: ADD ERROR CONDITION FOR SETTING CACHE ERROR THAT DOES NOT SEND 500*/
          handleError(err)
        })
  } catch(err) {
    handleError(res, err)
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

  if(idIsInvalid(product_id)) return handleClientError(res, INVALID_ID_MESSAGE)

  let values = [product_id, body, date_written, asker_name, asker_email, reported, helpful]
  Question.addNewQuestion(values)
    .then(()=> handlePostResponse(res))
    .catch(err => handleError(res, err))
}


const updateQuestionHelpfulness = (req, res) => {
  let question_id = parseInt(req.params.question_id)
  if(idIsInvalid(question_id)) return handleClientError(res, INVALID_ID_MESSAGE)
  Question.markQuestionAsHelpful(question_id)
    .then(() => handlePutResponse(res))
    .catch(err => handleError(res, err))
}


const reportQuestion = (req, res) => {
  let question_id = parseInt(req.params.question_id)
  if(idIsInvalid(question_id)) return handleClientError(res, INVALID_ID_MESSAGE)
  Question.reportQuestion(question_id)
    .then(() => handlePutResponse(res))
    .catch(err => handleError(res, err))
}


module.exports = {
  getQuestions,
  postQuestion,
  updateQuestionHelpfulness,
  reportQuestion
}