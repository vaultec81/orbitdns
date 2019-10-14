const Core = require("../../../core/core");

exports.gen = {
    async handler(request, h) {
        const { orbitdns } = request.server.app;
        const { name, type, seed } = request.payload;
        orbitdns.key.gen(name, type, seed);
        return h.response();
    }
}
exports.seed = {
    async handler(request, h) {
        const { orbitdns } = request.server.app;
        return h.response(orbitdns.key.seed());
    }
}
exports.list = {
    async handler(request, h) {
        const { orbitdns } = request.server.app;
        
        return h.response(await orbitdns.key.list());
    }
}
exports.get = {
    async handler(request, h) {
        /**
         * @type {Core}
         */
        const orbitdns = request.server.app.orbitdns;
        const { name } = request.payload;
        return h.response(await orbitdns.key.get(name));
    } 
}