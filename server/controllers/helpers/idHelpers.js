const INVALID_ID_MESSAGE = 'INVALID ID WAS SUBMITTED'
const getInvalidIdMessage = () => INVALID_ID_MESSAGE
const idIsInvalid = (id) => id === undefined || id < 0 || isNaN(id)

module.exports = {
  getInvalidIdMessage,
  idIsInvalid
}