require('dotenv').config()
const express = require('express')
const { getQuestions } = require('./helpers.js')

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.get('/qa/:product_id', (req, res) => {
  let product_id = req.params.product_id
  getQuestions(product_id)
    .then(data => {
      console.log(data.results)
    })
    .catch(err => {
      console.log(err)
    })
})

app.listen(3000, () => {
  console.log('Server listening on port: 3000')
})