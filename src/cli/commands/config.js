'use strict'

module.exports = {
  command: 'config <command>',

  description: 'Manage configuration',

  builder (yargs) {
    return yargs.commandDir('config');
  },

  handler (argv) {
  }
}