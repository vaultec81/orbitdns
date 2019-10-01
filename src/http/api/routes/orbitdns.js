'use strict'

const resources = require('../resources')

module.exports = [
    {
        method: "*",
        path: "/test",
        handler: resources.orbitdns.test.handler
    }, {
        method: "*",
        path: "/api/v0/resolve",
        handler: resources.orbitdns.resolve.handler
    }
];