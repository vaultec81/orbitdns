'use strict'

const resources = require('../resources')
const Joi = require('@hapi/joi')

module.exports = [
    {
        method: "*",
        path: "/api/v0/key/seed",
        handler: resources.key.seed.handler
    },
    {
        method: "*",
        path: "/api/v0/key/gen",
        options: {
            validate: resources.orbitdns.resolve.validate
        },
        handler: resources.key.gen.handler
    }
]