'use strict'

const resources = require('../resources')
const Joi = require('@hapi/joi')

module.exports = [
    {
        method: "*",
        path: "/api/v0/domain/get/{domain*}",
        options: {
            handler: resources.domain.get.handler,
            validate: {
                params: {
                    domain: Joi.string().required()
                }
            },
            pre: [
                //{ method: resources.domain.get.parseArgs, assign: 'args' }
            ]
        }
    },
    {
        method: "*",
        path: "/api/v0/domain/list",
        handler: resources.domain.list.handler
    }
]