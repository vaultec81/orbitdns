'use strict'

const pkg = require('../../../package.json')

module.exports = function version(self) {
    return () => {
        return new Promise((resolve, reject) => {
            resolve({
                version: pkg.version
            });
        });
    }
}