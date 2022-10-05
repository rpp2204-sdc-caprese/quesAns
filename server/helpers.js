const pg = require('pg')
const axios = require('axios')
const BASEURL = 'https://app-hrsei-api.herokuapp.com/api/fec2/hr-rpp'

const getQuestions = product_id => {
  return axios.get(`${BASEURL}/qa/questions?product_id=${product_id}&count=50`)
}


module.exports = {
  getQuestions
}