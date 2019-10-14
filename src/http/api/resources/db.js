const DagCbor = require('ipld-dag-cbor')
const base64url = require('base64url')

exports.get = {
    async handler(request, h) {
        const orbitdns = request.server.app.orbitdns;
        if(!request.orig.params) {
            return h.response(base64url.encode(DagCbor.util.serialize(orbitdns.db.get(""))));
        }
        const key = request.orig.params.key;
        return h.response(base64url.encode(DagCbor.util.serialize(orbitdns.db.get(key))));
    }
}
exports.put = {
    async handler(request, h) {
        const {orbitdns} = request.server.app;
        const value = request.payload.value;
        return h.response(await orbitdns.db.put(DagCbor.util.deserialize(base64url.toBuffer(value))));
    }
}
exports.del = {
    async handler(request, h) {
        const orbitdns = request.server.app.orbitdns;
        const key = request.orig.params.key;
        return h.response(await orbitdns.db.del(key));
    }
}