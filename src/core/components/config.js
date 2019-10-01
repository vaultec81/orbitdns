const Core = require('../core')
const path = require('path');
const fs = require('fs');
const _get = require('dlv')
const mergeOptions = require('merge-options')

function obj_set(obj, props, value) {
    if (typeof props == 'string') {
        props = props.split('.');
    }
    if (typeof props == 'symbol') {
        props = [props];
    }
    var lastProp = props.pop();
    if (!lastProp) {
        return false;
    }
    var thisProp;
    while ((thisProp = props.shift())) {
        if (typeof obj[thisProp] == 'undefined') {
            obj[thisProp] = {};
        }
        obj = obj[thisProp];
        if (!obj || typeof obj != 'object') {
            return false;
        }
    }
    obj[lastProp] = value;
    return true;
}

class config {
    /**
     * 
     * @param {Core} self 
     * @param {String} dir
     */
    constructor(self, dir) {
        this.self = self;
        this.path = path.join(dir, "config");
    }
    /**
     * Reloads config from fs.
     */
    reload() {
        var buf = fs.readFileSync(this.path).toString();
        var obj = JSON.parse(buf);
        //patch
        this.config = mergeOptions(this.confg, obj);
    }
    save() {
        var buf = Buffer.from(JSON.stringify(this.config, null, 2));
        fs.writeFileSync(this.path, buf);
    }
    /**
     * 
     * @param {String} key 
     */
    get(key) {
        if (typeof key === 'undefined') {
            return this.config;
        }

        if (typeof key !== 'string') {
            return new Error('Key ' + key + ' must be a string.');
        }
        return _get(this.config, key);
    }
    /**
     * 
     * @param {String} key 
     * @param {*} value 
     */
    set(key, value) {
        obj_set(this.config, key, value);
        this.save();
    }
    /**
     * Load config from json.
     */
    async open() {
        if(!fs.existsSync(this.path)) {
            this.init();
            return;
        }
        var buf = fs.readFileSync(this.path);
        this.config = JSON.parse(buf);
    }
    /**
     * Creates config with default settings
     * @param {Object} config custom config object
     */
    async init(config) {
        const defaultConfig = {
            netID: "/orbitdb/zdpuAnNJE7XuhdpS9rRBUzTooifzyGWE84zwM4futwaRH9Fgd/orbitdns",
            Addresses: {
                API: "/ip4/127.0.0.1/tcp/6001"
            },
            resolver: {
                upstream: "1.1.1.1"
            }
            
        };
        this.config = config || defaultConfig;
        this.save();
    }
    _isInitialized() {
        if(!fs.existsSync(this.path)) {
            return false;
        }
        return true;
    }
}
module.exports = config;