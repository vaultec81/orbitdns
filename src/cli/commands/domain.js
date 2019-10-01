'use strict'

module.exports = {
  command: 'domain <command>',

  description: 'Interact with domain name management.',

  builder (yargs) {
    return yargs.commandDir('domain');
  },

  handler (argv) {
  }
}