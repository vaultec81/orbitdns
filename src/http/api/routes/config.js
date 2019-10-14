'use strict'

const resources = require('../resources')
const Joi = require('@hapi/joi')

module.exports = [
    {
        method: '*',
        path: '/api/v0/config/{key?}',
        options: {
            pre: [
                { method: resources.config.getOrSet.parseArgs, assign: 'args' }
            ]
        },
        handler: resources.config.getOrSet.handler
    },
    {
        method: '*',
        path: '/api/v0/config/show',
        handler: resources.config.show
    },
]