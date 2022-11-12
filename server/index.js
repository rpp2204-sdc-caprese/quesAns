require('dotenv').config()
const PORT = process.env.PORT
const express = require('express')
const morgan = require('morgan')
const path = require('path')
const fs = require('fs')
const rt = require('file-stream-rotator')
const Writable = require('stream').Writable
const loaderio_verification_file = ''

const {
  getQuestions,
  postQuestion,
  updateQuestionHelpfulness,
  reportQuestion
} = require('./controllers/questionControllers.js')

const {
    getAnswers,
    postAnswer,
    updateAnswerHelpfulness,
    reportAnswer
} = require('./controllers/answerControllers.js')

//morgan error logger
let fileWriter = rt.getStream({filename:'errors.log', frequency:'daily', verbose: true})
const skipSuccess = (req, res) => res.statusCode < 400

const app = express()
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(morgan('combined', { skip: skipSuccess, stream: fileWriter }))

app.route('/qa/questions')
  .get(getQuestions)
  .post(postQuestion)

app.route('/qa/questions/:question_id/answers')
  .get(getAnswers)
  .post(postAnswer)

app.put('/qa/questions/:question_id/helpful', updateQuestionHelpfulness)
app.put('/qa/questions/:question_id/report', reportQuestion)
app.put('/qa/answers/:answer_id/helpful', updateAnswerHelpfulness)
app.put('/qa/answers/:answer_id/report', reportAnswer)

app.get(`/${loaderio_verification_file}.txt`, (req, res) => {
    res.send(loaderio_verification_file)
})

app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`)
})