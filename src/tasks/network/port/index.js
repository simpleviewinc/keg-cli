const { buildGlobalTaskAlias } = require('KegUtils/builders/buildGlobalTaskAlias')

module.exports = {
  port: buildGlobalTaskAlias({
    name: 'port',
    alias: [ 'p' ],
    description: 'Network tasks related to ports',
    example: 'keg net port kill 6070',
    tasks: {
      ...require('./kill')
    }
  })
}
