const redisClient = require('./redis.js')
const SECONDS_TIL_EXPIRATION = 3600

const Redis = {
  isRedisReady: () => redisClient.ping(),
  getCache: (key) => redisClient.get(key),
  setCache: (key, value) => redisClient.setEx(key, SECONDS_TIL_EXPIRATION, JSON.stringify(value))
}

module.exports = Redis