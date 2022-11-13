const handleGetResponse = (res, data) => res.status(200).send(data)
const handlePostResponse = (res) => res.sendStatus(201)
const handlePutResponse = (res) => res.sendStatus(204)
const handleClientError = (res, err) => res.status(404).send(err)
const handleError = (res, err) => {
  console.log(err)
  res.status(500).send(err)
}

const idIsInvalid = (id) => {
  return id === undefined || parseInt(id) < 0 || id.length === 0
}


module.exports = {
  handleGetResponse,
  handlePostResponse,
  handlePutResponse,
  handleClientError,
  handleError,
  idIsInvalid
}