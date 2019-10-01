const SignedObject = require('./SignedObject')

const base_list = [
    "SOA",
    "A",
    "AAAA",
    "TXT",
    "NS",
    "MX",
    "SRV",
    "CNAME"
]
class RecordTypes {

}
class BaseRecord {
    toSignedObject() {
        return SignedObject.cast(this)
    }
}
RecordTypes.A = class extends BaseRecord {
    constructor() {
        super()
        this.type = "A";
    }
    validate() {
        var re = new RegExp('((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$)){4}');
        if(re.test(this.record.target) === false) {
            return false;
        }
        return true;
    }
    static create(name, target, ttl) {
        var r = new RecordTypes.A();
        r.name = name;
        var record = {};
        record.ttl = ttl;
        record.target = target;
        r.record = record;
        return r;
    }
    static cast(obj) {
        var r = new RecordTypes.A();

        for (var prop in obj)
            r[prop] = obj[prop];
        return r;
    }
    
}
RecordTypes.AAAA = class extends BaseRecord {
    constructor() {
        super()
        this.type = "AAAA";
    }
    validate() {
        var re = new RegExp("(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))")
        if(re.test(this.record.target) === false) {
            return false;
        }
        return true;
    }
    static create(name, target, ttl) {
        var r = new RecordTypes.AAAA();
        r.name = name;
        var record = {};
        record.ttl = ttl;
        record.target = target;
        r.record = record;
        return r;
    }
    static cast(obj) {
        var r = new RecordTypes.AAAA();

        for (var prop in obj)
            r[prop] = obj[prop];
        return r;
    }
}
RecordTypes.TXT = class extends BaseRecord {
    constructor() {
        super()
        this.type = "TXT";
    }
    validate() {
        if(record.data.length > 255) {
            return false;
        }
        return true;
    }
    static create(name, data, ttl) {
        var r = new RecordTypes.TXT();
        r.name = name;
        var record = {};
        record.ttl = ttl;
        record.data = data
        r.record = record;
        return r;
    }
    static cast(obj) {
        var r = new RecordTypes.TXT();

        for (var prop in obj)
            r[prop] = obj[prop];
        return r;
    }
}
RecordTypes.SOA = class extends BaseRecord {
    constructor() {
        super();
        this.type = "SOA";
    }
    /**
     * Determines whether record is valid or not. 
     * @returns {Boolean}
     */
    validate() {
        if(this.DNSKeys.length === 0) {
            return false;
        }
        return true;
    }
    isInDNSKeys(publickey) {
        for(var value of this.DNSKeys) {
            if(value.publickey === publickey) {
                return true;
            }
        }
        return false;
    }
    static create(name, DNSKeys, serial, expire, ttl) {
        var r = new RecordTypes.SOA()
        r.name = name; //FQDN or TLD.
        r.DNSKeys = DNSKeys; //Array
        var record = {};
        record.serial = serial;
        record.expire = expire;
        record.ttl = ttl;
        r.record = record;
        return r;
    }
    static cast(obj) {
        var r = new RecordTypes.SOA();

        for (var prop in obj)
            r[prop] = obj[prop];
        return r;
    }
}
RecordTypes.MX = class extends BaseRecord {
    constructor() {
        super();
        this.type = "MX";
    }
    static cast(obj) {
        var r = new RecordTypes.MX();

        for (var prop in obj)
            r[prop] = obj[prop];
        return r;
    }
}
RecordTypes.CNAME = class extends BaseRecord {
    constructor() {
        super();
        this.type = "CNAME";
    }
    static create(name, target, ttl) {
        var r = new RecordTypes.CNAME();
        r.name = name;
        var record = {};
        record.ttl = ttl;
        record.target = target;
        r.record = record;
        return r;
    }
    static cast(obj) {
        var r = new RecordTypes.CNAME();

        for (var prop in obj)
            r[prop] = obj[prop];
        return r;
    }
}
exports = module.exports = RecordTypes;