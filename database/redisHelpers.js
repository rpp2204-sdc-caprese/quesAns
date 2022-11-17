const redisClient = require('./redis.js')
const SECONDS_TIL_EXPIRATION = 3600

let isInitiatingConnection = false;
let isReady = false;

redisClient
  .on('connect', () => isInitiatingConnection = true)
  .on('ready', () => isReady = true)
  .on('error', () => isReady = false)

const CheckRedis = {
  isConnecting: () => {
    return isInitiatingConnection;
  },
  isReady: () => {
    return isReady;
  }
}

const getCache  = async(key) => {
  const cache = await redisClient.get(key)
  return cache
}

const setCache = async(key, value) => {
  await redisClient.set(key, SECONDS_TIL_EXPIRATION, JSON.stringify(value))
}


module.exports = {
  getCache,
  setCache,
  CheckRedis
}