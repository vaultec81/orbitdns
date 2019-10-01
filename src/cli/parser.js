const yargs = require('yargs')
const utils = require('./utils')

const parser = yargs
    .commandDir('commands')
    .fail((msg, err, yargs) => {
        if (err) {
            throw err // preserve stack
        }
        utils.print(msg);
        yargs.showHelp();
    })
    .epilog(utils.ipfsPathHelp)
    .middleware(argv => Object.assign(argv, {
        getIpfs: utils.singleton(cb => utils.getIPFS(argv, cb)),
        print: utils.print,
        isDaemonOn: utils.isDaemonOn,
        getRepoPath: utils.getRepoPath
    }))
    .demandCommand(1)
    .help()
    .strict()
    .completion()


module.exports = parser