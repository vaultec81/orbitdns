module.exports = {
    command: 'list <name>',

    description: 'List available domains.',

    builder: {

    },

    handler(argv) {
        argv.resolve((async () => {
            //console.log(argv)
            const orbitdns = await argv.getOrbitDNS()
            console.log(orbitdns)
        })()) 
    }
}
