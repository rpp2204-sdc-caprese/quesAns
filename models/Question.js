const pool = require('../database/db.js');
const QuesQuery = require('./queries/QuesQuery.js')

const Question = {}

Question.getQuestions = async(product_id, count, offset) => {
  const client = await pool.connect()
  let results = [];
  return client
    .query(QuesQuery.select(), [product_id, count, offset])
    .then(async(questions) => {
        results = questions.rows
        for(let i = 0; i < results.length; i++) {
          for(let answer_id in results[i].answers) {
            let photo_urls = await client.query(QuesQuery.selectPhotos(), [answer_id])
            results[i].answers[answer_id].photos = photo_urls.rows[0].photos
          }
        }
        return results;
    })
    .catch(err => {
      console.log('There was an issue retrieving the data')
      return err;
    })
    .finally(() => client.release())
}

Question.addNewQuestion = (values) => {
  return pool.query(QuesQuery.insert(), values)
}

Question.markQuestionAsHelpful = (question_id) => {
  return pool.query(QuesQuery.updateHelpfulness(), [question_id])
}

Question.reportQuestion = (question_id) => {
  return pool.query(QuesQuery.updateReported(), [question_id])
}

module.exports = Question