const { EventEmitter } = require("events");
const mergeOptions = require('merge-options')
const path = require('path')
const Repo = require('./repo')
const os = require('os')
const components = require('./components/')
const OrbitName = require('./types/DataTypes').OrbitName;

class Api {
    constructor(Core) {
        this.core = Core;
    }
}
/**
 * Core working software bundle.
 */
class Core extends EventEmitter {
    constructor(options) {
        super();

        const defaults = {
            diretory: path.join(os.homedir(), '.orbitdns')
        };

        this._options = mergeOptions(defaults, options);
        this.repo = new Repo(this._options.diretory);
        this.key = new components.key(this);
        this.config = new components.config(this, this._options.diretory);
        this.domain = new components.domain(this);
        this.version = components.version(this)

        const onReady = () => {
            this.removeListener('error', onError)
            this._ready = true
        }
        const onError = err => {
            this.removeListener('ready', onReady)
            this._readyError = err
        }
        this.once('ready', onReady).once('error', onError)
        this.emit('ready');
        this._ready = true;
        this._running = false;
    }
    get ready() {
        return new Promise((resolve, reject) => {
            if (this._ready) return resolve(this)
            if (this._readyError) return reject(this._readyError)
            this.once('ready', () => resolve(this))
            this.once('error', reject)
        })
    }
    /**
     * Initializes a new OrbitDNS data folder.
     * @param {Object} config
     */
    async init(config) {
        await this.repo.init();
        await this.config.init()
    }
    async start() {
        
        try {
            await this.repo.open();
            await this.config.open()
        } catch(err) {

            console.log(err)
            this.emit("error", err)
            return;
        }
        
        //this.orbitdns = await OrbitDNS.openFromAddress(this.repo.ipfs, this.config.get('netID'), 
        //null, null, this.repo.orbitdb)
        try {
            this.db = await components.db(this);
        } catch(err) {
            console.log(err)
        }
        this.emit("start")
        this._running = true;
    }
    async close() {
        await this.repo.close();
        await this.config.save();
        this._running = false;
    }
    /**
     * Alias for close;
     */
    async stop() {
        await this.close();
    }
    /**
     * @param {String|OrbitName} domain
     * @param {Object} options format: orbitname or raw, type: A, SOA, etc
     */
    async get(domain, options) {
        options = options || {};
        const {type, format} = options;

        let name;
        if(OrbitName.is(domain)) {
            name = domain;
        } else {
            name = OrbitName.fromDnsName(domain);
        }
        if(type) {
            name.setType(type)
        } else {
            name.setType("SOA");
        }
        


    }
    /**
     * @param {String|OrbitName} domain
     * @param {Object} options
     */
    async resolve(domain, options) {
        options = options || {};
        const {type, format} = options;

        let name;
        if(OrbitName.is(domain)) {
            name = domain;
        } else {
            name = OrbitName.fromDnsName(domain);
        }
        if(type) {
            name.setType(type)
        } else {
            name.setType("A");
        }

        var result = this.db.get(name.toOrbitName())
        if(format === "targets" && type !== "SOA") {
            var out = [];
            for(var value of result) {
                out.push(value.record.target)
            }
            return out;
        } else {
            if(result.length === 1) {
                return result[0]
            }
            return result;
        }
    }
}
module.exports = Core;