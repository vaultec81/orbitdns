//const AccessController = require('orbit-db-access-controllers')
const pMapSeries = require('p-map-series')
const path = require('path')
// Make sure the given address has '/_access' as the last part
const ensureAddress = address => {
  const suffix = address.toString().split('/').pop()
  return suffix === '_access'
    ? address
    : path.join(address, '/_access')
}

const EventEmitter = require('events').EventEmitter
const DataTypes = require('./types/DataTypes')
const RecordTypes = require('./types/RecordTypes')
const SignedObject = require('./types/SignedObject')

class Validator {
  /**
   * 
   * @param {*} store OrbitDB Documentstore
   * @param {Object} root
   */
  constructor(store, root) {
    this.store = store;
    this.root = root;
    this.tldCache = {};
  }
  /**
   * 
   * @param {DataTypes.OrbitName} name
   * @param {Boolean} skipFirst
   * @returns {RecordTypes.SOA}
   */
  _findParentWithSOA(name, skipFirst) {
    var name1 = DataTypes.OrbitName.cast(name)
    name1.setType("SOA"); //Ensure looking for SOA record
    do {
      if(skipFirst) {
        name1 = name1.parent
      }
      var entry = this.store.get(name1.toOrbitName())[0]
      if(entry) {
        return RecordTypes.SOA.cast(entry)
      }
      name1 = name1.parent
    } while(name1.name.length !== 0)
    return null; //if no parent SOA could be found.
  }
  /**
   * Validate domain without validating TLD -> SOA authenticity.
   * Example check: AAAA -> example.ygg SOA.
   * Lowest level check
   * @param {Object} entry
   */
  validateName(entry) {
    var name = DataTypes.OrbitName.fromOrbitName(entry.id);
    var soa = this._findParentWithSOA(name);
    var record = RecordTypes[record.type].cast(entry)
    var publickey = entry.$publickey;
    if(!record.toSignedObject().validate(publickey)) {
      return false;
    }
    //Test for record validately reguardless of record type (A, AAAA, TXT etc)
    if(!record.validate()) {
      return false;
    }
    if(!soa.isInDNSKeys(publickey)) {
      return false;
    }
    return true;
  }
  /**
   * Exp check: example.ygg SOA -> .ygg TLD SOA
   * Grabs old SOA record to check whether, 
   * @param {Object} entry 
   */
  validateSOA(entry) {
    var name = DataTypes.OrbitName.fromOrbitName(entry.id)
    var soa = RecordTypes.SOA.cast(entry)
    var parent_soa = this._findParentWithSOA(name)

    //Signature check
    var validSig = SignedObject.cast(entry).validate(entry.$publickey);
    var publickey = entry.$publickey;
    if(!validSig) {
      return false;
    }

    if(!soa.validate()) {
      return false; //Valid SOA, ensure SOA does not violate rules.
    }
    var past_soa = this.store.get(name.toOrbitName())[0]; //Get SOA;
    if(past_soa) {
      
      past_soa = RecordTypes.SOA.cast(past_soa);

      if(past_soa.record.expire !== entry.record.expire) {
        //Instant rejection for attempting to change expiration.
        return false;
      }
    }

    return true;
  }
  /**
   * Checks validately of TLD
   * @param {Object} entry
   * @param {String} tld 
   */
  async validateTLD(entry) {
    var orbitName = DataTypes.OrbitName.fromOrbitName(entry.id);
    var soa = RecordTypes.SOA.cast(entry);
    if(!soa.validate()) {
      return false;
    }
    if(!soa.toSignedObject().validate(soa.$publickey)) {
      return false;
    }
    
    if(!soa.isInDNSKeys(soa.$publickey)) {
      return false;
    }
    //if(!this.root[orbitName.toDnsName()]) {
    //  return false;
    //}
    /*var a = false;
    var keys = await this.root(orbitName.toDnsName())
    for(var key of keys) {
      if(soa.$publickey === key.publickey) {
        a = true;
      }
    }
    if(a === false) 
      return false;
    */
    return true;
  }
}
/**
 * Special validation logic for Orbit DNS, not designed for any other purpose.
 */
class orbitDNSAC extends EventEmitter {
  constructor (orbitdb, options) {
    super();
    this._orbitdb = orbitdb
    this._db = null
    this._options = options || {}
    this._root = options.root;
  }

  // Returns the type of the access controller
  static get type () { return "orbitdns" }

  //Returns the address of the OrbitDB used as the AC
  get address () {
    return this._db.address
  }
  
  // Return true if entry is allowed to be added to the database
  async canAppend (entry, identityProvider) {
    console.log(entry.payload.value)
    for(var address in this._orbitdb.stores) {
      var split = address.split("/");
      if(split[3] === this._options.address.split("/")[3]) {
        if(split[split.length - 1] !== "_access") {
          this.store = this._orbitdb.stores[address]
        }
      }
    }
    this.validator = new Validator(this.store, this._root)
    
    
   
    
    //console.log(so.type)
    //console.log(RecordTypes[so.type].cast(so).validate())
    
    //Valid signature
    /*
    if(!RecordTypes[so.type].cast(so).validate() || !so.validate(so.$publickey)) {
      return false;
    }
    switch(so.type) {
      case "SOA":
        var contains = false;
        for(var key of so.DNSKeys) {
          if(key.publickey === key.publickey) {
            contains = true;
          }
        }
        if(!contains) {
          return false;
        }
        
    }*/
    var name = DataTypes.OrbitName.fromOrbitName(entry.payload.value.id)

    if(!entry.payload.value.type) {
      return false;
    }
    var record = RecordTypes[entry.payload.value.type].cast(entry.payload.value)
    if(name.isTLD()) {
      if(!(await this.validator.validateTLD(entry.payload.value))) {
        return false;
      }
    }
    if(record.type === "SOA") {
      if(!this.validator.validateSOA(record)) {
        return false;
      }
    } else { 
      if(!this.validator.validateName(record)) {
        return false;
      }
    }
    

    // Write keys and admins keys are allowed
    const access = new Set([...this.get('write'), ...this.get('admin')])
    // If the ACL contains the writer's public key or it contains '*'
    if (access.has(entry.identity.id) || access.has('*')) {
      const verifiedIdentity = await identityProvider.verifyIdentity(entry.identity)
      // Allow access if identity verifies
      return verifiedIdentity
    }

    return false
  }

  get capabilities () {
    if (this._db) {
      const capabilities = this._db.index

      const toSet = (e) => {
        const key = e[0]
        capabilities[key] = new Set([...(capabilities[key] || []), ...e[1]])
      }

      // Merge with the access controller of the database
      // and make sure all values are Sets
      Object.entries({
        ...capabilities,
        // Add the root access controller's 'write' access list
        // as admins on this controller
        ...{ admin: new Set([...(capabilities.admin || []), ...this._db.access.write]) }
      }).forEach(toSet)

      return capabilities
    }
    return {}
  }

  get (capability) {
    return this.capabilities[capability] || new Set([])
  }

  async close () {
    await this._db.close()
  }

  async load (address) {
    if (this._db) { await this._db.close() }

    // Force '<address>/_access' naming for the database
    this._db = await this._orbitdb.keyvalue(ensureAddress(address), {
      // use ipfs controller as a immutable "root controller"
      accessController: {
        type: 'ipfs',
        write: this._options.admin || [this._orbitdb.identity.id]
      },
      sync: true
    })

    this._db.events.on('ready', this._onUpdate.bind(this))
    this._db.events.on('write', this._onUpdate.bind(this))
    this._db.events.on('replicated', this._onUpdate.bind(this))

    await this._db.load()
  }

  async save () {
    // return the manifest data
    return {
      address: this._db.address.toString()
    }
  }

  async grant (capability, key) {
    // Merge current keys with the new key
    const capabilities = new Set([...(this._db.get(capability) || []), ...[key]])
    await this._db.put(capability, Array.from(capabilities.values()))
  }

  async revoke (capability, key) {
    const capabilities = new Set(this._db.get(capability) || [])
    capabilities.delete(key)
    if (capabilities.size > 0) {
      await this._db.put(capability, Array.from(capabilities.values()))
    } else {
      await this._db.del(capability)
    }
  }

  /* Private methods */
  _onUpdate () {
    this.emit('updated')
  }

  /* Factory */
  static async create (orbitdb, options = {}) {
    const ac = new orbitDNSAC(orbitdb, options)
    await ac.load(options.address || options.name || 'default-access-controller')
    
    // Add write access from options
    if (options.write && !options.address) {
      await pMapSeries(options.write, async (e) => ac.grant('write', e))
    }

    return ac
  }
}
orbitDNSAC.Validator = Validator;


module.exports = orbitDNSAC;