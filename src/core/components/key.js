const Core = require('../core')
const bip39 = require('bip39')
const EC = require('elliptic').ec;
const Key = require('interface-datastore').Key;
const CborDag = require('ipld-dag-cbor')
const DNSKey = require('../types/DataTypes').DNSKey;

/**
 * Class to manage keystore
 */
class key {
    /**
     * 
     * @param {Core} self 
     */
    constructor(self) {
        this.self = self;
    }
    /**
     * Generate 
     * @param {String} name 
     * @param {String} type ed25519 secp256k1 p256
     * @param {String} seed 
     * @returns {Promise<null>}
     */
    async gen(name, type, seed) {
        var ec = new EC(type);
        let entropy;
        let pair;
        if(seed) {
            entropy = bip39.mnemonicToSeedSync(seed);
            pair = ec.genKeyPair({ entropy: entropy });
        } else {
           pair = ec.genKeyPair();
        }
        var dnskey = new DataTypes.DNSKey(type, pair.getPublic(true, 'hex'), pair.getPrivate('hex'));
        var key = {dnskey: dnskey};
        await this.self.repo.keystore.put(new Key(name), CborDag.util.serialize(dnskey));
    }
    /**
     * @param {String} name
     * @returns {Promise<DNSKey>}
     */
    async get(name) {
        const buf = await this.self.repo.keystore.get(new Key(name));
        return CborDag.util.deserialize(buf);
    }
    async getPublicKey(name) {

    }
    async getDNSKey(name) {
        var key = await this.get(name);
        return DNSKey.cast(key.dnskey);
    }
    /**
     * 
     * @param {String} name 
     * @param {DNSKey} dnskey
     */
    async set(name, dnskey) {
        await this.self.repo.keystore.put(new Key(name), CborDag.util.serialize(dnskey));
    }
    /**
     * 
     * @param {String} name 
     */
    async delete(name) {
        await this.self.repo.keystore.delete(new Key(name));
    }
    /**
     * renames orbitdns key
     * @param {String} name 
     * @param {String} newname 
     */
    async rename(name, newname) {
        
    }
    /**
     * Creates a BIP39 memoric seed.
     * Make sure to backup this key.
     * @returns {String}
     */
    seed() {
        return bip39.generateMnemonic();
    }
}
module.exports = key;