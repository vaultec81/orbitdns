const OrbitDNS = require('../core')
const HttpApi = require('../http')
const Resolver = require('../core/resolver')
const fs = require('fs')
const path = require('path')

class Daemon {
    constructor(options) {
        this._options = options || {};
    }
    async start() {
        const orbitdns = new OrbitDNS();
        orbitdns.start();
        await new Promise((resolve, reject) => {
            orbitdns.once('error', err => {
                //this._log('error starting core', err)
                err.code = 'ENOENT';
                reject(err)
            })
            orbitdns.once('start', () => {
                resolve()
            })
        })
        this._orbitdns = orbitdns;
        const httpApi = new HttpApi(this._orbitdns, {})
        this._httpApi = await httpApi.start()
        if (this._httpApi._apiServers.length) {
            //await promisify(ipfs._repo.apiAddr.set)(this._httpApi._apiServers[0].info.ma)
        }
        this._httpApi._apiServers.forEach(apiServer => {
            var str = apiServer.info.ma.toString();
            if(str.includes("0.0.0.0")) {
                str = str.replace("0.0.0.0", "127.0.0.1")
            }
            console.log(str)
            //fs.writeFileSync(path.join(this._options.directory, "apiaddr"), apiServer.info.ma.toString())
        })
        console.log(Resolver)
        this.resolver = new Resolver(this._orbitdns);
        this.resolver.start();
        return this;
    }
    async stop() {
        await Promise.all([
            //this._httpApi && this._httpApi.stop(),
            this._orbitdns && this._orbitdns.stop(),
            

        ])
        
        return this;
    }
}
module.exports = Daemon;