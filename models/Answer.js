const pool = require('../database/db.js');
const { clientBegin, clientQuery, clientCommit, clientRollback, clientRelease } = require('../database/db.js')
const AnsQuery = require('./queries/AnsQuery.js')

const SELECT_QUERY = AnsQuery.select();
const INSERT_ANSWER = AnsQuery.insert();
const INSERT_PHOTOS = AnsQuery.insertPhotos();
const UPDATE_HELPFUL_QUERY = AnsQuery.updateHelpfulness();
const UPDATE_REPORTED_QUERY = AnsQuery.updateReported();


const Answer = {
  getAnswers: (question_id, count, offset) => pool.query(SELECT_QUERY, [question_id, count, offset]),
  markAnswerAsHelpful: (answer_id) => pool.query(UPDATE_HELPFUL_QUERY, [answer_id]),
  reportAnswer: (answer_id) => pool.query(UPDATE_REPORTED_QUERY, [answer_id]),
  addNewAnswer: async(values, photos) => {
    const client = await pool.connect()
    try {
      await clientBegin(client)
      let result = await clientQuery(client, INSERT_ANSWER, values)
      let answer_id = result.rows[0].id
      let photoQueries = []
      for(let i = 0; i < photos.length; i++) {
        photoQueries.push(clientQuery(client, INSERT_PHOTOS, [answer_id, photos[i]]))
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
}

module.exports = Answer