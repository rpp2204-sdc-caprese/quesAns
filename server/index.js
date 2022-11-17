require('dotenv').config()
const PORT = process.env.PORT
const express = require('express')
const app = express()
const morgan = require('morgan')
const config = require('../logger/logger.js')

const loaderio_verification_token = ''

/****CONTROLLERS****/
const { getQuestions, postQuestion, updateQuestionHelpfulness, reportQuestion } = require('./controllers/questionControllers.js')
const { getAnswers, postAnswer, updateAnswerHelpfulness, reportAnswer } = require('./controllers/answerControllers.js')
const { checkCache } = require('./controllers/checkCache.js')
const { validateId } = require('./controllers/validateId.js')

/****MIDDLEWARE****/
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(morgan('combined', config))

/****ROUTES****/
app.route('/qa/questions')
  .get(validateId, checkCache, getQuestions)
  .post(validateId, postQuestion)

app.route('/qa/questions/:question_id/answers')
  .get(validateId, checkCache, getAnswers)
  .post(validateId, postAnswer)

app.put('/qa/questions/:question_id/helpful', validateId,  updateQuestionHelpfulness)
app.put('/qa/questions/:question_id/report', validateId, reportQuestion)
app.put('/qa/answers/:answer_id/helpful', validateId, updateAnswerHelpfulness)
app.put('/qa/answers/:answer_id/report', validateId, reportAnswer)

app.get(`/${loaderio_verification_token}.txt`, (req, res) => {
    res.send(loaderio_verification_token)
})

/****SERVER****/
app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`)
})