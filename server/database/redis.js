require('dotenv').config()
const Redis = require('redis')
const URL = process.env.REDIS_HOST_URL

const redisClient = Redis.createClient({
  url: URL
})

async function connect() {
  try {
    await redisClient.connect()
  } catch(err) {
    console.log(err)
  }
}

connect()



module.exports = redisClient