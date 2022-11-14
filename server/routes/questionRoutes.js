const express = require('express')
const questionRouter = express.Router()
const questionIdRouter = express.Router({mergeParams: true}) //passed to child router so it can access the params from the parent router
const { getQuestions, postQuestion, updateQuestionHelpfulness, reportQuestion } = require('../controllers/questionControllers.js')
const { getAnswers, postAnswer } = require('../controllers/answerControllers.js')

questionRouter.use('/:question_id/', questionIdRouter)
questionRouter.route('/')
  .get(getQuestions)
  .post(postQuestion)

questionIdRouter.route('/helpful').put(updateQuestionHelpfulness)
questionIdRouter.route('/report').put(reportQuestion)
questionIdRouter.route('/answers')
  .get(getAnswers)
  .post(postAnswer)


module.exports = questionRouter;