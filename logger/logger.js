const fs = require('fs')
const rt = require('file-stream-rotator')
const Writable = require('stream').Writable

let fileWriter = rt.getStream({filename:'errors.log', frequency:'daily', verbose: true})
const skipSuccess = (req, res) => res.statusCode < 400

const config = { skip: skipSuccess, stream: fileWriter }

module.exports = config