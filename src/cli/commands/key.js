const Yargs = require('yargs')

module.exports = {
    command: "key <command>",
    describe: "Key management.",

    builder(yargs) {
        return yargs.commandDir('key');
    },

    handler(argv) {
    }
}