const datastoreFs = require('datastore-fs');
const fs = require('fs');
const IPFS = require('ipfs');
const OrbitDB = require('orbit-db')
const path = require('path');

/**
 * OrbitDNS repo
 * Currently supports nodejs native only.
 */
class Repo {
    /**
     * @param {String} repoPath - path where the repo is stored
     * @param {Object} opts - options pased down from parent
     */
    constructor(repoPath, opts) {
        this.closed = true
        this.path = repoPath
        opts = opts || {};

        this.keystore = null; //DNSKeystore
        this.ipfs = opts.ipfs || null;
        this.orbitdb = opts.orbitdb || null;
    }
    async init() {
        if (!fs.existsSync(this.path)) {
            fs.mkdirSync(this.path);
        }
    }
    _isInitialized() {
        if (!fs.existsSync(this.path)) {
            return true;
        }
        return false;
    }
    async open() {
        if (!this.keystore)
            this.keystore = new datastoreFs(path.join(this.path, "keystore"));

        if (!this.ipfs) {
            /**
             * @type {IPFS}
             */
            this.ipfs = new IPFS({
                config: {
                    Addresses: {
                        Swarm: [
                            "/ip4/0.0.0.0/tcp/4005",
                            "/ip4/0.0.0.0/tcp/4006/ws"
                        ]
                    }
                },
                start: true,
                EXPERIMENTAL: {
                    pubsub: true
                },
                repo: path.join(this.path, "ipfs")
            })
            //await this.ipfs.init();

            await this.ipfs.ready;
        }
        if(!this.orbitdb) {
            let AccessControllers = require('orbit-db-access-controllers')
            AccessControllers.addAccessController({ AccessController: require('./AccessController') })
            this.orbitdb = await OrbitDB.createInstance(this.ipfs, {
                AccessControllers: AccessControllers,
                directory: path.join(this.path, "orbitdb")
            });
        }
        //TLD root certs
        if(!this.root) {
            this.root = new datastoreFs(path.join(this.path, "root"), {
                extension: "trct"
            });
        }
        this.datastore = new datastoreFs(path.join(this.path, "datastore"))
        this.closed = false;
    }
    async close() {
        await this.orbitdb.disconnect()
        this.keystore.close()
        this.ipfs.stop()
        this.datastore.close()
        this.closed = true;
    }
}
module.exports = Repo;