'use strict'

module.exports = {
  command: 'net <command>',

  description: 'Interact with root TLD management',

  builder (yargs) {
    return yargs.commandDir('root');
  },

  handler (argv) {
  }
}