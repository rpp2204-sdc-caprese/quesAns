require('dotenv').config()
const PORT = process.env.PORT
const app = require('express')()
const morgan = require('morgan')
const config = require('../logger/logger.js')

const loaderio_verification_token = ''

/****CONTROLLERS****/
const { getQuestions, postQuestion, updateQuestionHelpfulness, reportQuestion } = require('./controllers/questionControllers.js')
const { getAnswers, postAnswer, updateAnswerHelpfulness, reportAnswer } = require('./controllers/answerControllers.js')

/****MIDDLEWARE****/
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(morgan('combined', config))

/****ROUTES****/
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

app.get(`/${loaderio_verification_token}.txt`, (req, res) => {
    res.send(loaderio_verification_token)
})

/****SERVER****/
app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`)
})