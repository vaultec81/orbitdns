const Core = require("../core")
const OrbitName = require('../types/').DataTypes.OrbitName;
const IDatastore = require('interface-datastore')
const Key = IDatastore.Key

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
    }
    /**
     * Gets domain from local domain store. 
     * Only domains that are locally imported, and thus have authority over.
     * @param {String|OrbitName} domain
     */
    async get(domain) {
        let txtName;
        if(OrbitName.is(domain)) {
            txtName = domain.toDnsName();
        } else {
            txtName = domain;
        }
        
        return await this.self.repo.datastore.get(new Key("domain/"+txtName))
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
        var result = this.self.db.get(name.toOrbitName());
        if (recursive) {
            for(var record of result) {
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
    list() {
        var lit = this.self.repo.keystore.query()
        console.log(lit)
    }
    /**
     * Originally copy from the experimental set of code
     * Pleast test functionality.
     * @param {OrbitName} name
     * @param {Boolean} skipFirst
     */
    findParentSOA(name, skipFirst) {
        var name1 = DataTypes.OrbitName.cast(name)
        name1.setType("SOA"); //Ensure looking for SOA record
        do {
            if (skipFirst) {
                name1 = name1.parent
            }
            console.log(name1)
            var entry = this.db.get(name1.toOrbitName())[0]
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

        return({

        })
    }
    /**
     * Preform a domain transfer
     * @param {String|OrbitName} domain
     * @param {Object} options
     */
    async transfer(domain, options) {
        /**
         * Removes ownership of domain, local DNSkeys will be removed from domain.
         */
        const { removeOwnership } = options;
        this.get(domain, { type: "SOA" })

        return ({
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