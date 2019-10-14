const Joi = require('@hapi/joi')
const Boom = require('@hapi/boom')
const OrbitName = require('../../../core/types').DataTypes.OrbitName;

// common pre request handler that parses the args and returns `key` which is assigned to `request.pre.args`
exports.parseKey = (request, h) => {
    if (!request.query.arg) {
        throw Boom.badRequest("Argument 'key' is required")
    }

}

exports.get = {
    parseArgs: exports.parseKey,
    async handler(request, h) {
        const { orbitdns } = request.server.app;
        const domain = request.orig.params.domain.split("/");
        const basename = domain[0]; const type = domain[1];

        var name = OrbitName.fromDnsName(basename);
        if (type) {
            name.setType(type);
        }
        let dataEncoding = request.query['data-encoding'];
        if (dataEncoding === "text") {
            dataEncoding = "utf8";
        }
        let result;
        console.log(name);
        try {
            result = await orbitdns.domain.get(name);
        } catch (err) {
            throw Boom.badRequest(err);
        }
        console.log(result);
        if (!result) {
            return h.response({});
        }
        return h.response(result);
    }
}
exports.list = {
    async handler(request, h) {
        const { orbitdns } = request.server.app;
    }
}
exports.listRecords = {
    async handler(request, h) {
        const { orbitdns } = request.server.app;
        const domain = request.orig.params.domain;
        var res = await orbitdns.domain.listRecords(domain);
        return h.response(res)
    }
}
exports.setRecord = {
    async handler(request, h) {

    }
}