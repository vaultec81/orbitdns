
exports.gen = {
    async handler(request, h) {

    }
}
exports.seed = {
    async handler(request, h) {
        const { orbitdns } = request.server.app
        return h.response(orbitdns.key.seed())
    }
}
