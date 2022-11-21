const { getCache, isRedisReady} = require('../../database/redisHelpers.js')
const { handleGetResponse, handleClientError } = require('./helpers/resHelpers.js')

const checkCache = (req, res, next) => {
    const { product_id } = req.query
    const count = req.query.count || 5
    const page = req.query.page || 1
    let redisQuestionKey = req.redisQuestionKey = `product_id=${product_id}&count=${count}&page=${page}`
    getCache(redisQuestionKey)
      .then((cache) => {
        if(cache) handleGetResponse(res, JSON.parse(cache))
        else next()
      })
      .catch((err) => handleClientError(res, err))
}

module.exports.checkCache = checkCache