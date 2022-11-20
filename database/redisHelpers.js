const redisClient = require('./redis.js')
const SECONDS_TIL_EXPIRATION = 3600

const Redis = {
  isRedisReady: async() => {
    return redisClient.ping();
  },

  getCache: async(key) => {
    return redisClient
      .get(key)
      .then(cache => cache)
      .catch(err => err)
  },

  setCache: async(key, value) => {
    await redisClient.setEx(key, SECONDS_TIL_EXPIRATION, JSON.stringify(value))
  }
}

module.exports = Redis