const OrbitDB = require('orbit-db')
const Core = require('../core')
/**
 * 
 * @param {Core} self 
 */
async function db(self) {
    var db = await self.repo.orbitdb.docstore(self.config.get("netID"), {
        indexBy: "id", accessController: {
            type: 'orbitdns',
            write: ["*"]
        }
    })
    await db.load();
    return db;
}
module.exports = db