const handleGetResponse = (res, data) => res.status(200).send(data)
const handlePostResponse = (res, data) => res.status(201).send(data)
const handlePutResponse = (res) => res.sendStatus(204)
const handleClientError = (res, err) => res.status(404).send(err)
const handleError = (res, err) => {
  console.log(err)
  res.status(500).send(err)
}


module.exports = {
  handleGetResponse,
  handlePostResponse,
  handlePutResponse,
  handleClientError,
  handleError
}