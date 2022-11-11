require('dotenv').config()
const Redis = require('redis')
const redisClient = Redis.createClient({
  socket: {
    host: process.env.REDIS_HOST
  }
})

module.exports = redisClient