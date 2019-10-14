const Joi = require('@hapi/joi');
const Boom = require('@hapi/boom');
const Core = require('../../../core');
const Key = require('interface-datastore').Key;
const DagCbor = require('ipld-dag-cbor');
const base64url = require('base64url');

class keyvalueapi {
    constructor(keystorename) {
        var name = keystorename;
        this.get = {
            async handler (request, h) {
                /**
                 * @type {Core}
                 */
                const orbitdns = request.server.app.orbitdns;
                const store = orbitdns.repo[name];
                const key = request.orig.params.key;
                if(!(await store.has(new Key(key)))) {
                    throw Boom.notFound();
                }
                
                return h.response(base64url.encode(await store.get(new Key(key)))).type("text/plain");
            }
        };
        this.put = {
            async handler (request, h) {
                /**
                 * @type {Core}
                 */
                const orbitdns = request.server.app.orbitdns;
                const store = orbitdns.repo[name];
                const key = request.orig.params.key;
                const value = request.payload.value;
                if(!value) {
                    throw Boom.badRequest("value param required")
                }
                
                return h.response(await store.put(new Key(key), base64url.toBuffer(value)))
            }
        };
        this.has = {
            async handler (request, h) {
                /**
                 * @type {Core}
                 */
                const orbitdns = request.server.app.orbitdns;
                const store = orbitdns.repo[name];
                const key = request.orig.params.key;
                return h.response(await store.has(new Key(key)));
            }
        };
        this.delete = {
            async handler (request, h) {
                /**
                 * @type {Core}
                 */
                const orbitdns = request.server.app.orbitdns;
                const store = orbitdns.repo[name];
                const key = request.orig.params.key;
                return h.response(await store.delete(new Key(key)));
            }
        };
        this.query = {
            async handler (request, h) {
                /**
                 * @type {Core}
                 */
                const orbitdns = request.server.app.orbitdns;
                const store = orbitdns.repo[name];
                const query = DagCbor.util.deserialize(base64url.toBuffer(request.orig.params.query));
                var it = store.query(query);
                let out = [];
                for await (let val of it) {
                    out.push(val)
                }
                return h.response(base64url.encode(DagCbor.util.serialize(out))).type("application/base64");
            }
        };
    }
}
exports.keystore = new keyvalueapi("keystore");
exports.datastore = new keyvalueapi("datastore");
exports.root = new keyvalueapi("root")