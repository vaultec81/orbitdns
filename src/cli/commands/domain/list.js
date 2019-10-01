module.exports = {
    command: 'list <name>',

    description: 'List available domains.',

    builder: {

    },

    handler(argv) {
        console.log(argv)
    }
}
