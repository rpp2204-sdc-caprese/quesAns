const pool = require('../database/db.js');
const AnsQuery = require('./queries/AnsQuery.js')


const Answer = {}

Answer.getAnswers = (question_id, count, offset) => {
  return pool.query(AnsQuery.select(), [question_id, count, offset])
}

Answer.addNewAnswer = async(values, photos) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    let result = await client.query(AnsQuery.insert(), values)
    let answer_id = result.rows[0].id
    let photoQueries = []
    for(let i = 0; i < photos.length; i++) {
      photoQueries.push(client.query(AnsQuery.insertPhotos(), [answer_id, photos[i]]))
    }
    await Promise.all(photoQueries)
    await client.query('COMMIT')
  } catch(err) {
    await client.query('ROLLBACK')
    console.error('There was an error during database transaction')
    return err;
  } finally {
    client.release();
  }
}

Answer.markAnswerAsHelpful = (answer_id) => {
  return pool.query(AnsQuery.updateHelpfulness(), [answer_id])
}

Answer.reportAnswer = (answer_id) => {
  return pool.query(AnsQuery.updateReported(), [answer_id])
}

module.exports = Answer