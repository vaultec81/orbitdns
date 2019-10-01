const Yargs = require('yargs')

module.exports = {
    command: "init",
    describe: "Create a new OrbitDNS data folder.",
    /**
     * 
     * @param {Yargs} yargs 
     */
    builder(yargs) {
        return yargs; //No options as of now.
    },
    handler(argv) {
        console.log("Initializing new OrbitDNS data folder.")
        argv.resolve((async () => {
            const Core = require("../../core/");
            const repoPath = argv.getRepoPath()
            var daemon = new Core({
                directory: repoPath
            });
            try {
                await daemon.init();
                
            } catch (err) {
                console.log(err)
            }
            
        })());

    }
}