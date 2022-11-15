const {
  handleGetResponse,
  handlePostResponse,
  handlePutResponse,
  handleClientError,
  handleError,
  idIsInvalid
} = require('./resHelpers.js')

const Answer = require('../../models/Answer.js')
const { getCache, setCache } = require('../../database/redisHelpers.js')


const getAnswers = async (req, res) => {
  let question_id = parseInt(req.params.question_id)
  let count = req.query.count || 5
  let page = req.query.page || 1
  let offset = (page - 1) * count

  if(idIsInvalid(question_id)) return handleClientError(res, 'MUST HAVE VALID QUESTION ID')

  try {
    // let redisAnswerKey = `question_id=${question_id}&count=${count}&page=${page}`;
    // const cache = await getCache(redisAnswerKey)
    // if(!!cache) {
    //   handleGetResponse(res, JSON.parse(cache))
    // } else {

      Answer.get(question_id, count, offset)
        .then(async(results) => {
          let response = {
            question: question_id,
            page: page,
            count: count,
          }
          response.results = results.rows
          //await setCache(redisAnswerKey, response)
          handleGetResponse(res, response)
        })
        .catch(err => {
          handleError(res, err)
        })
    // }
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

  if(idIsInvalid(question_id)) return handleClientError(res, 'MUST HAVE VALID QUESTION ID')

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
  if(idIsInvalid(answer_id)) return handleClientError(res, 'MUST HAVE VALID ANSWER ID')
  Answer.updateHelpfulness(answer_id)
    .then(() => handlePutResponse(res))
    .catch(err => handleError(res, err))
}


const reportAnswer = (req, res) => {
  let answer_id = parseInt(req.params.answer_id)
  if(idIsInvalid(answer_id)) return handleClientError(res, 'MUST HAVE VALID ANSWER ID')
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