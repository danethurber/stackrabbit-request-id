'use strict'

const expect = require('chai').expect
const stackrabbit = require('stackrabbit')
const uuid = require('node-uuid')

const requestId = require('.')

describe('requestId middleware', () => {
  const validUUIDTest = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  const defaultHeaderKey = 'x-request-id'

  it('should exist', () => {
    expect(requestId).to.exist
    expect(requestId).to.be.a('function')
  })

  it('should return stackrabbit middleware', () => {
    const middleware = requestId()
    expect(middleware.constructor.name).to.eql('GeneratorFunction')
  })

  describe('when there is no existing request id', () => {
    let generatedId
    let message = {
      content: new Buffer('message content'),
      fields: {},
      properties: {
        headers: {}
      }
    }

    beforeEach(function * () {
      const listener = stackrabbit({ rabbitUrl: 'asdf', queueName: 'qwer' })

      listener.use(requestId())
      listener.listen(function * (next) {
        yield next
      })

      yield listener._composedStack(message)

      generatedId = message.properties.headers[defaultHeaderKey]
    })

    it('should generate a uuid and set it in the headers', function * () {
      expect(generatedId).to.exist
      expect(generatedId).to.match(validUUIDTest)
    })
  })

  describe('when there is an existing request id', () => {
    const tmpUUID = uuid.v4()
    const message = {
      content: new Buffer('message content'),
      fields: {},
      properties: {
        headers: {
          [defaultHeaderKey]: tmpUUID
        }
      }
    }

    beforeEach(function * () {
      const listener = stackrabbit({ rabbitUrl: 'asdf', queueName: 'qwer' })

      listener.use(requestId())
      listener.listen(function * (next) {
        yield next
      })

      yield listener._composedStack(message)
    })

    it('should keep the old value', function * () {
      const id = message.properties.headers[defaultHeaderKey]

      expect(id).to.exist
      expect(id).to.eql(tmpUUID)
    })
  })
})
