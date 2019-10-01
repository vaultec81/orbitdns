const YargsPromise = require('yargs-promise')
const parser = require('./parser')
const cli = new YargsPromise(parser)
//const commandAlias = require('./command-alias')
const { print } = require('./utils')


const args = process.argv.slice(2)
cli
    .parse(args)
    .then((input) => {
      const { data, argv } = input;
        //getIpfs = argv.getIpfs
        if (data) {
          print(data)
        }
    })
    .catch((bug) => {
        //getIpfs = argv.getIpfs
        console.log(bug)
        /*if (error.message) {
          print(error.message)
          debug(error)
        } else {
          print('Unknown error, please re-run the command with DEBUG=ipfs:cli to see debug output')
          debug(error)
        }*/
        process.exit(1)
    })
    .finally(() => {
        //if (getIpfs && getIpfs.instance) {
        //const cleanup = getIpfs.rest[0]
        //return cleanup()
        //}
    })
