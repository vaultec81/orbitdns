module.exports = {
    command: 'register <name>',

    description: 'Creates a new domain name.',

    builder: {
        key: {
            alias: "k",
            describe: ""
        }
    },

    handler(argv) {
        console.log(argv)
    }
}
