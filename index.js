'use strict'

const uuid = require('node-uuid')

module.exports = function(key) {
  key = key || 'x-request-id'

  return function * requestId(next) {
    const message = this.message
    const headers = message && message.properties && message.properties.headers
      ? message.properties.headers
      : null

    if (headers) headers[key] = headers[key] || uuid.v4()

    yield next
  }
}
