'use strict'

const resources = require('../resources')
const Joi = require('@hapi/joi')

class datastoreapi {
    constructor(name) {
        this.list = [
            {
                method: "*",
                path: `/api/v0/repo/${name}/get/{key*}`,
                options: {
                    handler: resources.repo[name].get.handler,
                    validate: {
                        params: {
                            key: Joi.string().required()
                        }
                    },
                    pre: [
                        //{ method: resources.domain.get.parseArgs, assign: 'args' }
                    ]
                }
            },
            {
                method: "*",
                path: `/api/v0/repo/${name}/put/{key*}`,
                options: {
                    handler: resources.repo[name].put.handler,
                    validate: {
                        params: {
                            key: Joi.string().required()
                        }
                    }
                }
            },
            {
                method: "*",
                path: `/api/v0/repo/${name}/has/{key*}`,
                options: {
                    handler: resources.repo[name].has.handler,
                    validate: {
                        params: {
                            key: Joi.string().required()
                        }
                    }
                }
            },
            {
                method: "*",
                path: `/api/v0/repo/${name}/delete/{key*}`,
                options: {
                    handler: resources.repo[name].delete.handler,
                    validate: {
                        params: {
                            key: Joi.string().required()
                        }
                    }
                }
            },
            {
                method: "*",
                path: `/api/v0/repo/${name}/query/{query*}`,
                options: {
                    encoding: null,
                    handler: resources.repo[name].query.handler,
                    validate: {
                        params: {
                            query: Joi.string().required()
                        }
                    }
                }
            }
        ]
    }
}
module.exports = [
    ...new datastoreapi("datastore").list,
    ...new datastoreapi("keystore").list,
    ...new datastoreapi("root").list
]