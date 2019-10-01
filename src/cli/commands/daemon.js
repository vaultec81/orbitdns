const Yargs = require('yargs')

module.exports = {
    command: "daemon",
    describe: "Start a long running daemon process",
    /**
     * 
     * @param {Yargs} yargs 
     */
    builder(yargs) {
        return yargs; //No options as of now.
    },
    handler(argv) {
        argv.resolve((async () => {
            const {print} = argv;
            const Daemon = require("../daemon");
            const repoPath = argv.getRepoPath()
            var daemon = new Daemon({
                directory: repoPath
            });
            try {
                await daemon.start();
                daemon._httpApi._apiServers.forEach(apiServer => {
                    print(`API listening on ${apiServer.info.ma.toString()}`)
                })
            } catch (err) {
                console.log(err)
            }
            const cleanup = async () => {
                //print(`Received interrupt signal, shutting down...`)
                await daemon.stop()
                process.exit(0)
            }

            // listen for graceful termination
            process.on('SIGTERM', cleanup)
            process.on('SIGINT', cleanup)
            process.on('SIGHUP', cleanup)
        })());

    }
}