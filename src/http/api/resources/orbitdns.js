const Joi = require('@hapi/joi')
const OrbitName = require('../../../core/types/DataTypes').OrbitName;

exports.test = {
  async handler(request, h) {
    //const key = request.pre.args.key
    console.log(request.server.app.orbitdns.db.get(""))
    return h.response(await request.server.app.orbitdns.version()).header('X-Stream-Output', '1');
  }
}
exports.resolve = {
  validate: {
    //domain: Joi.string(),
    //type: Joi.string(),
    //format: Joi.string()
  },
  async handler(request, h) {
    /**
     * @type {Orbitnds}
     */
    const {orbitdns} = request.server.app;
    const {domain, type, format} = request.payload;
    var name = OrbitName.fromDnsName(domain)
    console.log(type)
    if(type) {
      name.setType(type);
    } else {
      name.setType("A");
    }
    console.log(name)
    if(format) {
      if(format === "targets") {
        var val = await orbitdns.resolve(name, {type: type, format: format})
        console.log(val)
        return h.response();
        
      } else {
        //Default JSON output
        return h.response(await orbitdns.resolve(name, {type: type, format: format}));
      }
    } else {
      //Default JSON output
      return h.response(await orbitdns.resolve(name));
    }
  }
}