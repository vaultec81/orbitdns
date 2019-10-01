const Yargs = require('yargs')

module.exports = {
    command: "help",
    describe: "Prints help command.",
    /**
     * 
     * @param {Yargs} yargs 
     */
    builder(yargs) {
        return yargs; //No options as of now.
    },
    handler(argv) {
        argv.resolve((async () => {            
        })());
    }
}