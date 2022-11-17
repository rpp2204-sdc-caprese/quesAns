const redisClient = require('./redis.js')
const SECONDS_TIL_EXPIRATION = 3600

const Redis = {
  isRedisReady: async() => {
    return await redisClient.ping();
  },

  getCache: async(key) => {
    return await redisClient.get(key)
  },

  setCache: async(key, value) => {
    await redisClient.set(key, SECONDS_TIL_EXPIRATION, JSON.stringify(value))
  }
}

module.exports = Redis