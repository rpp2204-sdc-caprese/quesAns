require('dotenv').config()
const pg = require('pg')
const axios = require('axios')
const BASEURL = 'https://app-hrsei-api.herokuapp.com/api/fec2/hr-rpp'
const APIKEY = process.env.APIKEY

const getQuestions = product_id => {
  return axios.get(`${BASEURL}/qa/questions`, {params: {product_id: product_id}, headers: {'Authorization': APIKEY}})
}


module.exports = {
  getQuestions
}