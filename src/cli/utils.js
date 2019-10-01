const fs = require('fs')
const os = require('os')
const promisify = require('promisify-es6')



exports.getRepoPath = () => {
    return process.env.ORBITDNS_PATH || os.homedir() + '/.orbitdns'
}

exports.isDaemonOn = isDaemonOn
function isDaemonOn() {
    try {
        fs.readFileSync(path.join(exports.getRepoPath(), 'api'))
        log('daemon is on')
        return true
    } catch (err) {
        log('daemon is off')
        return false
    }
}
exports.getAPICtl = getAPICtl
function getAPICtl(apiAddr) {
    if (!apiAddr && !isDaemonOn()) {
        throw new Error('daemon is not on')
    }
    if (!apiAddr) {
        const apiPath = path.join(exports.getRepoPath(), 'api')
        apiAddr = multiaddr(fs.readFileSync(apiPath).toString()).toString()
    }
    // Required inline to reduce startup time
    //const APIctl = require('ipfs-http-client')
    return APIctl(apiAddr)
}
exports.getIPFS = async (argv) => {
    if (argv.api || isDaemonOn()) {
        return callback(null, getAPICtl(argv.api), promisify((cb) => cb()))
    }

    // Required inline to reduce startup time
    const core = require('../core/')
    const node = new Core({
        directory: exports.getRepoPath()
    })

    const cleanup = async () => {
        if (node) {
            node.close()
        }
    }


    node.on('error', (err) => {
        throw err
    })

    node.once('ready', () => {
        callback(null, node, cleanup)
    })
}
exports.singleton = create => {
    const requests = []
    const getter = promisify(cb => {
        if (getter.instance) return cb(null, getter.instance, ...getter.rest)
        requests.push(cb)
        if (requests.length > 1) return
        create((err, instance, ...rest) => {
            getter.instance = instance
            getter.rest = rest
            while (requests.length) requests.pop()(err, instance, ...rest)
        })
    })
    return getter
}


let visible = true
exports.disablePrinting = () => { visible = false }

exports.print = (msg, newline, isError = false) => {
    if (newline === undefined) {
        newline = true
    }

    if (visible) {
        if (msg === undefined) {
            msg = ''
        }
        msg = newline ? msg + '\n' : msg
        const outStream = isError ? process.stderr : process.stdout
        outStream.write(msg)
    }
}

exports.ipfsPathHelp = 'orbitdns uses a repository in the local file system. By default, the repo is ' +
  'located at ~/.orbitdns. To change the repo location, set the $ORBITDNS_PATH environment variable:\n\n' +
  'export ORBITDNS_PATH=/path/to/ipfsrepo\n'