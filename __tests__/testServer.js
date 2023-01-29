const express = require('express')
const Question = require('../')
// const { getQuestions, postQuestion, updateQuestionHelpfulness, reportQuestion } = require('../server/controllers/questionControllers.js')
// const { getAnswers, postAnswer, updateAnswerHelpfulness, reportAnswer } = require('../server/controllers/answerControllers.js')

const createServer = () => {
  const app = express()
  app.use(express.json())

  app.route('/qa/questions')
  .get((req, res) => {
    pool.query()
  })
  .post(postQuestion)

  app.route('/qa/questions/:question_id/answers')
    .get(getAnswers)
    .post(postAnswer)

  app.put('/qa/questions/:question_id/helpful', updateQuestionHelpfulness)
  app.put('/qa/questions/:question_id/report', reportQuestion)
  app.put('/qa/answers/:answer_id/helpful', updateAnswerHelpfulness)
  app.put('/qa/answers/:answer_id/report', reportAnswer)

  return app
}

module.exports = createServer