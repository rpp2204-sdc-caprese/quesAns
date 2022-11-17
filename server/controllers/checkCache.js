const { getCache, isRedisReady} = require('../../database/redisHelpers.js')
const { handleGetResponse, handleClientError } = require('./helpers/resHelpers.js')
let redisIsReady = isRedisReady()

const checkCache = async(req, res, next) => {
  try {
    const { product_id } = req.query
    const count = req.query.count || 5
    const page = req.query.page || 1
    let redisQuestionKey = req.redisQuestionKey = `product_id=${product_id}&count=${count}&page=${page}`
    if(redisIsReady) {
      const cache = await getCache(redisQuestionKey)
      if(!!cache) {
        handleGetResponse(res, JSON.parse(cache))
      } else /*RESULT IS NOT CACHED*/ {
        next()
      }
    } else /*REDIS IS NOT CONNECTED*/ {
      next()
    }
  } catch(err) {
    handleClientError(res,err)
  }
}

module.exports.checkCache = checkCache