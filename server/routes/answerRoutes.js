const express = require('express')
const answerRouter = express.Router()
const { updateAnswerHelpfulness, reportAnswer } = require('../controllers/answerControllers.js')

answerRouter.route('/helpful').put(updateAnswerHelpfulness)
answerRouter.route('/report') .put(reportAnswer)

module.exports = answerRouter;