
module.exports = async (request, h) => {
    const { orbitdns } = request.server.app
    const version = await orbitdns.version()

    return h.response({
        Version: version.version,
    })
}
