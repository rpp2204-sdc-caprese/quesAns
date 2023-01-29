const pool = require('../database/db.js');
const QuesQuery = require('./queries/QuesQuery.js')

const SELECT_QUERY = QuesQuery.select();
const INSERT_QUERY = QuesQuery.insert();
const UPDATE_HELPFUL_QUERY = QuesQuery.updateHelpfulness();
const UPDATE_REPORTED_QUERY = QuesQuery.updateReported();

const Question = {
  getQuestions: (product_id, count, offset) => pool.query(SELECT_QUERY, [product_id, count, offset]),
  addNewQuestion: (values) => pool.query(INSERT_QUERY, values),
  markQuestionAsHelpful: (question_id) => pool.query(UPDATE_HELPFUL_QUERY, [question_id]),
  reportQuestion: (question_id) => pool.query(UPDATE_REPORTED_QUERY, [question_id])
}

module.exports = Question