const { buildGlobalTaskAlias } = require('KegUtils/builders/buildGlobalTaskAlias')

module.exports = {
  network: buildGlobalTaskAlias({
    name: 'network',
    alias: [ 'net' ],
    description: 'Keg CLI network-related tasks',
    example: 'keg network <command> <options>',
    tasks: {
      ...require('./kill'),
      ...require('./list')
    }
  })
}
