const Core = require('../core')
class net {
    /**
     * 
     * @param {Core} self 
     */
    constructor(self) {
        this.self = self;
    }
    import(cert) {

    }
    /**
     * @return {String}
     */
    async create() {
        var db = await this.self.repo.orbitdb.docstore("orbitdns", {
            indexBy: 'id',
            accessController: {
                write: ["*"]
            }
        })
        return db.address;
    }
}
module.exports = net;