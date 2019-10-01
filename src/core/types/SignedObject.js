const Utils = require('elliptic').utils;
const EC = require('elliptic').ec;
const dagCBOR = require('ipld-dag-cbor')

class SignedObject {
    /**
     * 
     * @param {KeyPair} pair 
     * @param {String} type EC curve type
     * @returns {SignedObject}
     */
    sign(pair, type) {
        var obj = JSON.parse(JSON.stringify(this)); //Simple object copy!
        delete obj["$signature"]; delete obj["$publickey"]; delete obj["$type"]
        var derSign = pair.sign(Utils.toArray(dagCBOR.util.serialize(obj))).toDER()
        obj["$signature"] = Buffer.from(derSign).toString('base64');
        obj["$publickey"] = pair.getPublic(true, 'hex');
        obj["$type"] = type; 
        var signedObject = new SignedObject();

        for (var prop in obj)
            signedObject[prop] = obj[prop];
        return signedObject;
    }
    /**
     * Checks whether object is valid
     * @param {*} publicKey 
     * @returns {Boolean}
     */
    validate(publicKey) {
        var obj = JSON.parse(JSON.stringify(this)); //Simple object copy!
        if(!obj["$signature"]) {
            return false;
        }
        var sig = Buffer.from(obj["$signature"], 'base64');
        var type = obj["$type"];
        delete obj["$signature"]; delete obj["$publickey"]; delete obj["$type"]; //Remove data not important to signature

        var ec = new EC(type)
        let pub;
        if (publicKey === Buffer) {
            pub = ec.keyFromPublic(Utils.toArray(publicKey), 'bin')
            //ec.keyFromPublic
        } else if (typeof publicKey === "string") {
            pub = ec.keyFromPublic(publicKey, 'hex') //Assume using hex
        }
        return pub.verify(Utils.toArray(dagCBOR.util.serialize(obj)), Utils.toArray(sig))
    }
    /**
     * Converts Object into CborDag
     * @returns {Buffer}
     */
    toCborDag() {
        return dagCBOR.util.serialize(this)
    }
    static is(obj) {
        if(obj["$signature"] && obj["$publickey"] && obj["$type"]) {
            return true
        } else {
            return false;
        }
    }
    /**
     * 
     * @param {Object} obj
     * @returns {SignedObject} 
     */
    static cast(obj) {
        var signedObject = new SignedObject();

        for (var prop in obj)
            signedObject[prop] = obj[prop];
        return signedObject;
    }
    /**
     * 
     * @param {JSON} json 
     * @returns {SignedObject}
     */
    static fromJSON(json) {
        let obj;
        if (typeof json === "string") {
            obj = JSON.parse(json);
        } else if (typeof json === "object") {
            obj = json;
        }
        var signedObject = new SignedObject();
    
        for (var prop in obj)
            signedObject[prop] = obj[prop];
        return signedObject;
    }
    /**
     * Converts CborDag into javascript object
     * @param {Buffer} bin 
     */
    static fromCborDag(bin) {
        return SignedObject.cast(dagCBOR.util.deserialize(bin))
    }
}

exports = module.exports = SignedObject;