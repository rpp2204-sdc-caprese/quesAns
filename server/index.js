const express = require('express')
const pg = require('pg')

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.listen(3000, () => {
  console.log('Server listening on port: 3000')
})