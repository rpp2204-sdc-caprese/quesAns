const redisClient = require('./redis.js')


const getCache  = async(key) => {
  const cache = await redisClient.get(key)
  return cache
}


const setCache = async(key, value) => {
  await redisClient.set(key, JSON.stringify(value))
}


module.exports = {
  getCache,
  setCache
}