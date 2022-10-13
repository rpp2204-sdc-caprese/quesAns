require('dotenv').config()
const express = require('express')
//const { getQuestions } = require('./helpers.js')
const { db , getQuestions, getAnswers } = require('./etl.js')

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.get('/qa/questions', (req, res) => {
  let product_id = req.query.product_id
  let page = req.query.page || 1
  let count = req.query.count || 5
  getQuestions(product_id)
    .then(results => {
      //console.log('IN INDEX', results.data)
      console.log(results)
      res.send(results)
    })
    .catch(err => {
      console.log(err)
      res.send(err)
    })
})

app.get('/qa/questions/:question_id/answers', (req, res) => {
  let question_id = req.params.question_id
  getAnswers(question_id)
    .then(results => {
      console.log('ANSWER RESPONSE', results)
      res.send(results)
    })
    .catch(err => {
      console.log(err)
      res.send(err)
    })
})

app.listen(3000, () => {
  console.log('Server listening on port: 3000')
})



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