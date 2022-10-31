const db = require('./server/etl.js')
const app = require('./server/index.js')
const request = require('supertest')

// beforeAll(done => {
//   server = app.listen(3002)
// })
let server;

beforeEach(() => {
  server = app.listen(4000)
})

afterEach(() => {
  server.close()
})

describe('GET questions', () => {
  it('Should return status code 200', async () => {
    let product_id = 900011
    const response = await request(server).get(`/qa/questions?product_id=900011`)///questions?product_id`)//=${product_id}`)
    //console.log('RESPONSE', response)
    expect(response.statusCode).toBe(200)
  })

  it('Should return status code 404 if there is no product_id',  async () => {
    const response = await request(server).get('qa/questions')
    expect(response.statusCode).toBe(404)
  })
})

// afterAll(done => {
//   server.close()
//   done()
// })