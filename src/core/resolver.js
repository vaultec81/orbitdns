const Named = require('node-named')
const dns = require('dns');
const OrbitDNS = require('.')

var records = {};
[
    'A',
    'AAAA',
    'MX',
    'SOA',
    'SRV',
    'TXT',
    'AAAA',
    'CNAME'
].forEach(function (r) {
    var lcr = r.toLowerCase();
    records[lcr.toUpperCase()] = require("node-named/lib/" + 'records/' + lcr);
});
class Resolver {
    /**
     * 
     * @param {OrbitDNS} orbitdns 
     * @param {Object} options 
     */
    constructor(orbitdns, options) {
        this.orbitdns = orbitdns;
        //this._options = options || {};
        this.named = Named.createServer();
        if(!options) {
            options = {host: "::ffff:127.0.0.1", port: 53};
        }
        const {address} = options;

        this.port = options.port; this.host = options.host;
    }
    async query(name, type) {
        return this.orbitdns.domain.get(name, {type:type})
    }
    start() {
        this.named.listen(this.port, this.host, ()=> {
            console.log('DNS server started on port '+this.port);
        });
        this.named.on('query', async (query) => {
            var type = query.type();
            var domain = query.name();
            console.log('DNS Query: %s', domain);
            //var target = new named.SOARecord(domain, { serial: 12345 });
            console.log(records);
            //var target = new records[query.type()]("127.0.0.1");
            //query.addAnswer(domain, target, 300);
            
            if(type === "SOA") {
                var r = await this.query(domain, type)
                console.log(r)
                if(r.length !== 0) {
                    for(var value of r) {
                        var record = value.record;
                        var target = new records[type](domain,{
                            ttl: record.ttl,
                            expire: record.expire
                        })
                    }
                    query.addAnswer(domain, target, 300)
                }
            }
            

            this.named.send(query);
        })
    }
}
module.exports = Resolver;