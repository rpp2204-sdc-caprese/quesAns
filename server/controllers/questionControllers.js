const {
  handleGetResponse,
  handlePostResponse,
  handlePutResponse,
  handleClientError,
  handleError,
  idIsInvalid
} = require('./resHelpers.js')

const Question = require('../../models/Question.js')
const { getCache, setCache } = require('../../database/redisHelpers.js')


const getQuestions = async(req, res) => {
  let product_id = parseInt(req.query.product_id)
  let count = req.query.count || 5
  let page = req.query.page || 1
  let offset = (page - 1) * count

  if(idIsInvalid(product_id)) return handleClientError(res, 'MUST HAVE VALID PRODUCT ID')

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

      Question.get(product_id, count, offset)
        .then(results => {
          response.results = results;
          //await setCache(redisQuestionKey, response)
          handleGetResponse(res, response)
        })
        .catch(err => {
          handleError(err)
        })
    //}
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

  if(idIsInvalid(product_id)) return handleClientError(res, 'MUST HAVE VALID PRODUCT ID')

  let values = [product_id, body, date_written, asker_name, asker_email, reported, helpful]
  Question.create(values)
    .then(()=> handlePostResponse(res))
    .catch(err => handleError(res, err))
}


const updateQuestionHelpfulness = (req, res) => {
  let question_id = parseInt(req.params.question_id)
  if(idIsInvalid(question_id)) return handleClientError(res, 'MUST HAVE VALID QUESTION ID')
  Question.updateHelpfulness(question_id)
    .then(() => handlePutResponse(res))
    .catch(err => handleError(res, err))
}


const reportQuestion = (req, res) => {
  let question_id = parseInt(req.params.question_id)
  if(idIsInvalid(question_id)) return handleClientError(res, 'MUST HAVE VALID QUESTION ID')
  Question.updateReported(question_id)
    .then(() => handlePutResponse(res))
    .catch(err => handleError(res, err))
}


module.exports = {
  getQuestions,
  postQuestion,
  updateQuestionHelpfulness,
  reportQuestion
}