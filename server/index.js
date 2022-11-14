require('dotenv').config()
const PORT = process.env.PORT
const express = require('express')
const morgan = require('morgan')
const rt = require('file-stream-rotator')
const Writable = require('stream').Writable
const path = require('path')
const fs = require('fs')
const loaderio_verification_token = ''

//morgan error logger
let fileWriter = rt.getStream({filename:'errors.log', frequency:'daily', verbose: true})
const skipSuccess = (req, res) => res.statusCode < 400

const app = express()
const router = express.Router()
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(morgan('combined', { skip: skipSuccess, stream: fileWriter }))

app.use('/qa/questions', require('./routes/questionRoutes'))
app.use('/qa/answers/:answer_id', require('./routes/answerRoutes'))

app.get(`/${loaderio_verification_token}.txt`, (req, res) => {
    res.send(loaderio_verification_token)
})

app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`)
})