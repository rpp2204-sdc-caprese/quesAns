const redisClient = require('./redis.js')
const SECONDS_TIL_EXPIRATION = 3600

let isConnected = false;
redisClient.on('connect', () => {
  isConnected = true;
})

let isReady = false;
redisClient.on('ready', () => {
  isReady = true;
})

const getCache  = async(key) => {
  const cache = await redisClient.get(key)
  return cache
}

const setCache = async(key, value) => {
  await redisClient.set(key, SECONDS_TIL_EXPIRATION, JSON.stringify(value))
}

const CheckRedis = {}

CheckRedis.isConnected = () => {
  return isConnected;
}

CheckRedis.isReady = () => {
  return isReady;
}




module.exports = {
  getCache,
  setCache,
  CheckRedis
}