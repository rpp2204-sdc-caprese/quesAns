const {
  handleGetResponse,
  handlePostResponse,
  handlePutResponse,
  handleClientError,
  handleError
} = require('./resHelpers.js')

const pool = require('./db.js')

const getAnswers = async (req, res) => {

  let question_id = req.params.question_id
  let count = req.query.count || 5
  let page = req.query.page || 1

  if(question_id === undefined || parseInt(question_id) < 0 || question_id.length === 0) {
    return handleClientError(res, 'MUST HAVE VALID PRODUCT ID')
  }

  let response = {
    question: question_id,
    page: page,
    count: count,
    results: []
  }
  let offset = (page - 1) * count

  let query = {
    text: `select id as answer_id, body, date_written as date, answerer_name, helpful as helpfulness from answers where question_id = $1 and reported = false limit $2 offset $3`,
    values: [question_id, count, offset]
  }

  return pool.query(query)
    .then(async(results) => {
      response.results = results.rows
      for(let i = 0; i < response.results.length; i++) {
        let query = {
          text: 'select id, url from answers_photos where answer_id = $1',
          values: [response.results[i].answer_id]
        }
        let photos_urls = await pool.query(query)
        response.results[i].photos = photos_urls.rows
      }
      return response
    })
    .then(response => {
      handleGetResponse(res, response)
    })
    .catch(err => {
      handleError(res, err)
    })

}


const postAnswer = (req, res) => {

  let question_id = parseInt(req.params.question_id)

  let answer;
  if(typeof req.body.data !== 'object') {
    answer = JSON.parse(req.body.data)
  } else {
    answer = req.body.data
  }

  let body = answer.body
  let date_written = new Date().toISOString()
  let name = answer.name
  let email = answer.email
  let photos = answer.rawPhotos
  let reported = false
  let helpful = 0
  console.log(body, name, email, photos)

  let answerQuery = {
    text: 'insert into answers(question_id, body, date_written, answerer_name, answerer_email, reported, helpful) values($1, $2, $3, $4, $5, $6, $7) returning id',
    values: [question_id, body, date_written, name, email, reported, helpful]
  }

  return pool.query(answerQuery)
    .then(results => {
      let answer_id = results.rows[0].id
      return answer_id
    })
    .then(answer_id => {
      let photoQueries = []
      for(let i = 0; i < photos.length; i++) {
        let photoQuery = {
          text: 'insert into answers_photos(answer_id, url) values($1, $2)',
          values: [answer_id, photos[i]]
        }
        photoQueries.push(pool.query(photoQuery))
      }

      return Promise.all(photoQueries)
    })
    .then(results => {
      console.log('AFTER PROMISE ALL: ', results)
      handlePostResponse(res, results)
    })
    .catch(err => {
      handleError(res, err)
    })
}


const updateAnswerHelpfulness = (req, res) => {
  let answer_id = req.params.answer_id
  let query = {
    text: 'update answers set helpful = helpful + 1 where id = $1',
    values: [answer_id]
  }

  return pool.query(query)
    .then(results => {
      handlePutResponse(res, results)
    })
    .catch(err => {
      handleError(res, err)
    })
}

const reportAnswer = (req, res) => {
  let answer_id = req.params.answer_id
  let query = {
    text: 'update answers set reported = true where id = $1',
    values: [answer_id]
  }

  return pool.query(query)
    .then(results => {
      handlePutResponse(res, results)
    })
    .catch(err => {
      handleError(res, err)
    })
}