'use strict'

module.exports = {
  command: 'net <command>',

  description: 'Interact wth network management',

  builder (yargs) {
    return yargs.commandDir('net');
  },

  handler (argv) {
  }
}