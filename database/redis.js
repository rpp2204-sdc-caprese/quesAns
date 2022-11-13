require('dotenv').config()
const Redis = require('redis')
const URL = process.env.REDIS_HOST_URL

const redisClient = Redis.createClient({
  url: URL
})

redisClient.connect()
  .then(() => console.log('Redis is connected'))
  .catch(err => {
    if(err.message === 'Connection timeout') {
      console.log('Redis: ' + err.message)
    } else {
      console.error(err)
    }
  })

module.exports = redisClient