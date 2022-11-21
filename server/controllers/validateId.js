const { handleClientError } = require('./helpers/resHelpers.js')
const INVALID_ID_MESSAGE = 'INVALID ID WAS SUBMITTED'

const idIsInvalid = (id) => id === undefined || id <= 0 || isNaN(id)

const validateId = (req, res, next) => {
  let id = req.query.product_id || req.params.question_id || req.params.answer_id
  if(idIsInvalid(Number(id))) return handleClientError(res, INVALID_ID_MESSAGE)
  else next()
}

module.exports.validateId = validateId