const Core = require('../core')
const Key = require('interface-datastore').Key;
const DNSKey = require('../types/DataTypes').DNSKey;
const CborDag = require('ipld-dag-cbor')
const OrbitName = require('../types/').DataTypes.OrbitName

/**
 * Management for root TLD DNSKeys
 */
class root {
    /**
     * 
     * @param {Core} self 
     */
    constructor(self) {
        this.self = self;
        this.rootStore = this.self.repo.root;
    }
    /**
     * 
     * @param {String} tld 
     * @param {DNSKey} signingKey
     * @param {DNSKey[]} DNSKeys 
     */
    async create(tld, signingKey, DNSKeys) {
        signingKey = DataTypes.DNSKey.cast(signingKey)
        var orbitname = DataTypes.OrbitName.fromDnsName(tldName)
        var inDNSKeys = [];
        if (DNSKeys) {
            for (var key of DNSKeys) {
                inDNSKeys.push(key.clean());
            }
        } else {
            throw "DNSKeys required";
        }
        if(!signingKey) {
            throw "signingKey required"
        }
        orbitname.setType("SOA");
        var tld = SignedObject.cast(RecordTypes.SOA.create(tldName, DNSKeys, 0, 0, 240000))
        tld.id = orbitname.toOrbitName()
        return await this.db.put(tld.sign(signingKey.getPair(), signingKey.type))
    }
    /**
     * 
     * @param {String} name 
     * @param {*} cert 
     */
    import(name, cert) {

    }
    /**
     * 
     * @param {String} name 
     * @param {String} format
     */
    export(name, format) {
        this.rootStore.get(new Key(name))
    }
    /**
     * 
     * @param {String} name 
     */
    remove(name) {
        
    }
    /**
     * 
     * @param {String} name 
     * @param {DNSKey[]} DNSKeys
     */
    create(name, DNSKeys) {


        var obj = {};
        obj.name = name;

    }
    async get(tld) {
        console.log(await this.rootStore.get(new Key(tld)));
    }
}

class rootCert {
    /**
     * 
     * @param {root} mgr 
     */
    constructor(mgr) {
        /**
         * @type {root}
         */
        this.mgr = mgr;
    }
    /**
     * Creates a default structure for rootCert
     */
    template() {
        this.cert = {
            signingKeys: [],
            /**
             * @type {String}
             */
            domain: null
        };
        //Signature template.
    }
    serialize() {
        CborDag.util.serialize(this.cert);
    }
    async save() {
        if(mgr) {
            await mgr.self.rootStore.put(new Key(this.cert.domain), this.serialize())
        } else {
            throw "function not avaliable"
        }
    }
    static deserialize(bin) {
        var obj = {cert: CborDag.util.deserialize(bin)}
        return rootCert.cast(obj)
    }
    /**
     * 
     * @param {Object} obj
     * @returns {rootCert} 
     */
    static cast(obj) {
        var cert = new rootCert();

        for (var prop in obj)
            cert[prop] = obj[prop];
        return cert;
    }
}

module.exports = root;
module.exports.rootCert = rootCert;