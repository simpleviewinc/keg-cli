
module.exports = {
  proxy: {
    name: 'proxy',
    alias: [ 'prx', 'px' ],
    tasks: {
      ...require('./attach'),
      ...require('./build'),
      ...require('./destroy'),
      ...require('./list'),
      ...require('./open'),
      ...require('./stop'),
      ...require('./start'),
    },
    description: 'Keg Proxy specific tasks',
    example: 'keg proxy <command> <options>'
  }
}
