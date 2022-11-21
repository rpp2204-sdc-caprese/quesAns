const pool = require('../database/db.js');
const { clientBegin, clientQuery, clientCommit, clientRollback, clientRelease } = require('../database/db.js')
const AnsQuery = require('./queries/AnsQuery.js')


const Answer = {}

Answer.getAnswers = (question_id, count, offset) => {
  return pool.query(AnsQuery.select(), [question_id, count, offset])
}

Answer.addNewAnswer = async(values, photos) => {
  const client = await pool.connect()
  try {
    await clientBegin(client)
    let result = await clientQuery(client, AnsQuery.insert(), values)
    let answer_id = result.rows[0].id
    let photoQueries = []
    for(let i = 0; i < photos.length; i++) {
      photoQueries.push(clientQuery(client, AnsQuery.insertPhotos(), [answer_id, photos[i]]))
    }
    await Promise.all(photoQueries)
    await clientCommit(client)
  } catch(err) {
    await clientRollback(client)
    console.error('There was an error during database transaction')
    return err;
  } finally {
    clientRelease(client);
  }
}

Answer.markAnswerAsHelpful = (answer_id) => {
  return pool.query(AnsQuery.updateHelpfulness(), [answer_id])
}

Answer.reportAnswer = (answer_id) => {
  return pool.query(AnsQuery.updateReported(), [answer_id])
}

module.exports = Answer