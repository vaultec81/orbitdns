const EC = require('elliptic').ec;
const bip39 = require('bip39')

class DataTypes {

}
class DNSKey {
    /**
     * 
     * @param {String} type 
     * @param {String} publickey 
     * @param {String} privatekey 
     */
    constructor(type, publickey, privatekey) {
        this.type = type;
        this.publickey = publickey;
        this.privatekey = privatekey;
    }
    /**
     * Export as a signed certificate.
     */
    exportAsCert() {

    }
    /**
     * MUST DO BEFORE PUBLIC EXPORT!
     * @param {Boolean} self
     */
    clean(self) {
        if(self) {
            delete this.privatekey;
            return this;
        }
        var k = DataTypes.DNSKey.cast(this);
        delete k.privatekey;
        return k;
    }
    verify(data, signature) {
        var ec = new EC(this.type);
        const pub = ec.keyFromPublic(this.publickey, 'hex')
        return pub.verify(data, signature)
    }
    /**
     * Returns keypair instance
     */
    getPair() {
        var ec = new EC(this.type);
        const pair = ec.keyFromPrivate(this.privatekey, 'hex')
        return pair;
    }
    signer() {
        if(!this.privatekey) {
            return null;
        }
        var ec = new EC(this.type);
        const priv = ec.keyFromPrivate(this.privatekey, 'hex');
        return {
            sign(data) {
                return priv.sign(data).toDER("hex")
            },
            destroy() {
                //delete ec;
                //delete priv;
            }
        }
    }
    compare(publicKey) {
        return publicKey === this.publickey;
    }
    static cast(obj) {
        var DNSKey = new DataTypes.DNSKey();

        for (var prop in obj)
            DNSKey[prop] = obj[prop];
        return DNSKey;
    }
}
class MultisigKey {

}
class OrbitName {
    /**
     * 
     * @param {String[]} nameArray 
     * @param {Object} code 
     */
    constructor(nameArray, code) {
        this.name = nameArray
        
        if(code) {
            this.code = code;
        } else {
            this.code = {};
        }
    }
    toOrbitName() {
        var fqdn = this.name.join(".");
        var array = [fqdn]
        if(this.code.type) {
            array.push("$"+this.code.type);
        }
        if(this.code.index) {
            array.push("#"+this.code.index)
        }
        return array.join("/")
    }
    toDnsName() {
        var temp = Object.assign([], this.name); temp.reverse()
        return temp.join()
    }
    get tld() {
        return this.name[0];
    }
    get parent() {
        var list = []
        for(var x = 0; x < this.name.length-1; x++) {
            list.push(this.name[x])
        }
        return new OrbitName(list, this.code)
    }
    /**
     * 
     * @param {String} type 
     */
    setType(type) {
        this.code.type = type.toUpperCase();
        return this;
    }
    setIndex(index) {
        this.code.index = index;
        return this;
    }
    isTLD() {
        if(this.name.length === 1) {
            return true;
        }
        return false;
    }
    /**
     * Converts from normal DNS syntax (example.com)
     * @param {String} name
     * @returns {OrbitName} 
     */
    static fromDnsName(name) {
        var array = name.split(".")
        array.reverse()
        return new OrbitName(array);
    }
    /**
     * Converts from yggName syntax (com.exmple)
     * @param {String} name
     * @returns {OrbitName} 
     */
    static fromOrbitName(name) {
        var deslash = name.split("/");
        var array = deslash[0].split(".");deslash.reverse(); deslash.pop();
        var code = {};
        for(var value of deslash) {
            if(value[0] === "$") {
                code.type = value.split("$")[1];
            }
            if(value[0] === "#") {
                code.index = value.split("#")[1];
            }
        }
        return new OrbitName(array, code);
    }
    static cast(obj) {
        var r = new OrbitName();

        for (var prop in obj)
            r[prop] = obj[prop];
        return r;
    }
    static is(obj) {
        return obj instanceof OrbitName;
    }
}
/**
 * Special class to create a object representing a certain DNS operation or change. 
 * Can be serialized and sent over IPC or HTTP API. 
 */
DataTypes.DNSAction = class {

}
exports = module.exports = DataTypes;
exports.DNSKey = DNSKey;
exports.OrbitName = OrbitName;