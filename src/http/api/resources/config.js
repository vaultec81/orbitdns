'use strict'

const Joi = require('@hapi/joi')
const get = require('dlv')
const set = require('just-safe-set')
const Boom = require('@hapi/boom')

exports.getOrSet = {
    // pre request handler that parses the args and returns `key` & `value` which are assigned to `request.pre.args`
    parseArgs(request, h) {
        const parseValue = (args) => {
            if (request.query.bool !== undefined) {
                args.value = args.value === 'true'
            } else if (request.query.json !== undefined) {
                try {
                    args.value = JSON.parse(args.value)
                } catch (err) {
                    log.error(err)
                    throw Boom.badRequest('failed to unmarshal json. ' + err)
                }
            }

            return args
        }

        if (request.query.arg instanceof Array) {
            return parseValue({
                key: request.query.key,
                value: request.query.arg
            })
        }

        if (request.params.key) {
            return parseValue({
                key: request.params.key,
                value: request.query.value
            })
        }

        if (!request.query.arg) {
            throw Boom.badRequest("Argument 'key' is required")
        }

        return { key: request.query.arg }
    },

    // main route handler which is called after the above `parseArgs`, but only if the args were valid
    async handler(request, h) {
        const { orbitdns } = request.server.app
        const { key } = request.pre.key
        let { value } = request.pre.value

        // check that value exists - typeof null === 'object'
        if (value && (typeof value === 'object' &&
            value.type === 'Buffer')) {
            throw Boom.badRequest('Invalid value type')
        }

        let originalConfig
        try {
            originalConfig = await orbitdns.config.get()
        } catch (err) {
            throw Boom.boomify(err, { message: 'Failed to get config value' })
        }

        if (value === undefined) {
            // Get the value of a given key
            value = get(originalConfig, key)
            if (value === undefined) {
                throw Boom.notFound('Failed to get config value: key has no attributes')
            }
        } else {
            // Set the new value of a given key
            const result = set(originalConfig, key, value)
            if (!result) {
                throw Boom.badRequest('Failed to set config value')
            }
            try {
                await orbitdns.config.replace(originalConfig)
            } catch (err) {
                throw Boom.boomify(err, { message: 'Failed to replace config value' })
            }
        }

        return h.response({
            key: key,
            value: value
        })
    }
}

exports.show = async (request, h) => {
    const { orbitdns } = request.server.app
  
    let config
    try {
      config = await orbitdns.config.get()
    } catch (err) {
      throw Boom.boomify(err, { message: 'Failed to get config value' })
    }
  
    return h.response(config)
  }
  