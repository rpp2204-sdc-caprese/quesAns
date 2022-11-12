const redisClient = require('./redis.js')
const EXPIRATION_SEC = 60


const getCache  = async(key) => {
  const cache = await redisClient.get(key)
  return cache
}


const setCache = async(key, value) => {
  await redisClient.set(key, EXPIRATION_SEC, JSON.stringify(value))
}


module.exports = {
  getCache,
  setCache
}