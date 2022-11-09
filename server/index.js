require('dotenv').config()
const PORT = process.env.PORT
const express = require('express')
const morgan = require('morgan')
const path = require('path')
const fs = require('fs')
const rt = require('file-stream-rotator')
const Writable = require('stream').Writable

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

const app = express()

let fileWriter = rt.getStream({filename:'errors.log', frequency:'daily', verbose: true})
const skipSuccess = (req, res) => res.statusCode < 400


app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(morgan('combined', {
    skip: skipSuccess,
    stream: fileWriter
}))


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

app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`)
})

module.exports = app

/*FOR TESTING
product_ids: 900010 - 1000011
question_ids: 3167068 - 3518963
answer_ids: 6191376 - 6879306
*/


/* GET QUESTIONS FOR PRODUCT  //SELECT * FROM QUESTIONS WHERE product_id =
{
    "product_id": "71701",
    "results": [
        {
            "question_id": 642474,
            "question_body": "test",
            "question_date": "2022-07-22T00:00:00.000Z",
            "asker_name": "test",
            "question_helpfulness": 30,
            "reported": false,
            "answers": {
                "5988569": {
                    "id": 5988569,
                    "body": "test",
                    "date": "2022-09-16T00:00:00.000Z",
                    "answerer_name": "abba",
                    "helpfulness": 2,
                    "photos": [
                        "https://res.cloudinary.com/dc3r923zh/image/upload/v1663312492/f6koofaj/p1dwfscjiohfwq0iqapc.jpg"
                    ]
                },
                "5988595": {
                    "id": 5988595,
                    "body": "test optimizations",
                    "date": "2022-09-18T00:00:00.000Z",
                    "answerer_name": "spongebob",
                    "helpfulness": 0,
                    "photos": []
                }
            }
        }
    ]
*/

/* GET ANSWERS FOR QUESTION
{
    "question": "642474",
    "page": 1,
    "count": 5,
    "results": [
        {
            "answer_id": 5988569,
            "body": "test",
            "date": "2022-09-16T00:00:00.000Z",
            "answerer_name": "abba",
            "helpfulness": 2,
            "photos": [
                {
                    "id": 5342300,
                    "url": "https://res.cloudinary.com/dc3r923zh/image/upload/v1663312492/f6koofaj/p1dwfscjiohfwq0iqapc.jpg"
                }
            ]
        },
        {
            "answer_id": 5988620,
            "body": "hello test",
            "date": "2022-09-18T00:00:00.000Z",
            "answerer_name": "spongebom",
            "helpfulness": 0,
            "photos": [
                {
                    "id": 5342341,
                    "url": "http://res.cloudinary.com/red-bean-rulez/image/upload/f_auto/v1663542736/FEC_project/zfmvyebzgz2hcj543fa2.jpg"
                }
            ]
        }
    ]
}
*/