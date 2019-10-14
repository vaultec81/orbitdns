'use strict'

const resources = require('../resources')
const Joi = require('@hapi/joi')

module.exports = [
    {
        method: "*",
        path: `/api/v0/db/get/{key*}`,
        options: {
            handler: resources.db.get.handler
        }
    },
    {
        method: "*",
        path: `/api/v0/db/put/`,
        options: {
            handler: resources.db.put.handler,
        }
    },
    {
        method: "*",
        path: `/api/v0/db/del/{key*}`,
        options: {
            handler: resources.db.del.handler,
            validate: {
                params: {
                    key: Joi.string().required()
                }
            }
        }
    }
]