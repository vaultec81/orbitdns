'use strict' 

module.exports = [
    ...require('./orbitdns'),
    require('./version'),
    ...require('./domain'),
    ...require('./key')
]