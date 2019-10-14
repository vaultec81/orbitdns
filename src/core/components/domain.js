const Core = require("../core")
const OrbitName = require('../types/').DataTypes.OrbitName;
const IDatastore = require('interface-datastore')
const Key = IDatastore.Key
const RecordTypes = require('../types/DataTypes')
const DNSKey = require('../types/DataTypes').DNSKey;

/**
 * Domain creation request
 * This is sent to root TLD
 */
class dcr {
    constructor(domain, DNSKeys) {

    }
}
class domain {
    /**
     * 
     * @param {Core} self 
     */
    constructor(self) {
        this.self = self;
        this.transfers = {};
    }
    /**
     * Gets domain from local domain store. 
     * Only domains that are locally imported, and thus have authority over.
     * @param {String|OrbitName} domain
     */
    async get(domain) {
        let txtName;
        if (OrbitName.is(domain)) {
            txtName = domain.toDnsName();
        } else {
            txtName = domain;
        }

        return await this.self.repo.datastore.get(new Key("domain/" + txtName))
    }
    /**
     * Resolves DNS record to entry.
     * @todo Add support for internal CNAME. recursive option.
     * @param {String|OrbitName} domain
     * @param {Object} options
     */
    async resolve(domain, options) {
        options = options || {};
        const { type, format, recursive } = options;

        let name;
        if (OrbitName.is(domain)) {
            name = domain;
        } else {
            name = OrbitName.fromDnsName(domain);
            if (type) {
                name.setType(type);
            } else {
                name.setType("SOA");
            }
        }
        if (!(await this.self.repo.root.has(name.tld))) {
            return null;
        }
        var result = await this.self.db.get(name.toOrbitName());
        if (recursive) {
            for (var record of result) {
                console.log(record)
            }
        }
        if (result.length === 1) {
            return result[0];
        } else {
            return result;
        }

    }
    /*async create(domain, key) {
        let txtName;
        if (OrbitName.is(domain)) {
            txtName = domain.toDnsName()
        } else if (typeof domain === "string") {
            txtName = domain;
        } else {
            throw `Invalid arguments domain is ${domain}`
        }

    }*/
    /**
     * List domain that have been registered with this node.
     */
    async list() {
        var it = this.self.repo.datastore.query({ keysOnly: true, prefix:"domain"});
        var out = [];
        for await (let val of it) {
            out.push(val.key._buf.toString().replace("/", ""))
        }
        return out;
    }
    /**
     * List records of a particular domain.
     * Does not return full record.
     * @param {String|OrbitName} domain
     */
    async listRecords(domain) {
        let name;
        if (OrbitName.is(domain)) {
            name = domain;
        } else {
            name = OrbitName.fromDnsName(domain);
        }
        var records = {};
        var result = await this.self.db.get(name.toOrbitName())
        for (var value of result) {
            if (!records[value.type]) {
                records[value.type] = [];
            }
            var rname = OrbitName.fromOrbitName(value.id);
            if (!rname.code.index) {
                records[value.type].push(0)
            } else {
                records[value.type].push(rname.code.index)
            }
        }
        return records;
    }
    /**
     * Originally copy from the experimental set of code
     * Pleast test functionality.
     * @param {OrbitName} name
     * @param {Boolean} skipFirst
     */
    async findParentSOA(name, skipFirst) {
        var name1 = DataTypes.OrbitName.cast(name)
        name1.setType("SOA"); //Ensure looking for SOA record
        do {
            if (skipFirst) {
                name1 = name1.parent
            }
            console.log(name1)
            var entry = (await this.db.get(name1.toOrbitName()))[0]
            if (entry) {
                return RecordTypes.SOA.cast(entry)
            }
            name1 = name1.parent
        } while (name1.name.length !== 0)
        return null; //if no parent SOA could be found.
    }
    /**
     * 
     * @param {String|OrbitName} domain
     * @param {String} key string name of local DNSKey
     */
    async create(domain, key) {
        let txtName;
        if (OrbitName.is(domain)) {
            txtName = domain.toDnsName()
        } else if (typeof domain === "string") {
            txtName = domain;
        } else {
            throw `Invalid arguments domain is ${domain}`
        }

        return ({

        })
    }
    get record() {
        /**
         * 
         * @param {String|OrbitName} domain 
         * @param {String} target 
         * @param {String} type 
         * @param {Object} options 
         */
        async function add(domain, target, type, options) {
            const { key } = options;
            if (type === "SOA" | !this.RecordTypes[type]) {
                throw `${type} is not an accepted type`;
            }
            if (typeof domain === "string") {
                domain = OrbitName.fromDnsName(domain);
            }
            /**
             * @type {DNSkey}
             */
            let dnskey;
            if (key) {
                dnskey = this.self.keystore.get(key)
            } else if (options.dnskey) {
                dnskey = options.dnskey;
            } else {
                throw `dnskey or key name required`;
            }
            var record = new recordTypes[type](domain, target, { ttl: 360 });
            dnskey.
                this.self.db.put()
        }
        /**
         * 
         * @param {String|OrbitName} domain 
         * @param {String} target 
         * @param {String} type
         * @param {Number} index
         * @param {Object} options 
         */
        function set(domain, target, type, index, options) {
            const { key } = options;
            if (!index) {
                throw "index is required in options";
            }
            if (typeof domain === "string") {
                domain = OrbitName.fromDnsName(domain);
            }
            let dnskey;
            if (key) {
                dnskey = this.self.keystore.get(key)
            } else if (options.dnskey) {
                dnskey = options.dnskey;
            } else {
                throw ``;
            }
        }
        const funcs = {
            set: set,
            add: add
        }
        return (funcs)
    }
    /**
     * Preform a domain transfer.
     * Integration with HTTP API 
     * @param {String|OrbitName} domain
     * @param {Object} options
     */
    async transfer(domain, options) {
        if (this.transfers[domain.toDnsName()]) {
            return this.transfers[domain.toDnsName()];
        }
        /**
         * Removes ownership of domain, local DNSkeys will be removed from domain.
         */
        const { removeOwnership } = options;
        var SOA = await this.get(domain, { type: "SOA" });

        var owners = SOA.DNSKeys;
        /**
         * @param {String|Number} id
         */
        owners.remove = (id) => {
            if (typeof id === "string") {
                for (var n in owners) {
                    if (owners[n].publickey === id) {
                        delete owners[n];
                    }
                }
            } else if (typeof id === "number") {
                delete owners[id]
            }
        }
        return ({
            owners: owners,
            add() {

            },
            /**
             * Execute domain transfer.
             */
            execute() {

            }
        })
    }
}
module.exports = domain;