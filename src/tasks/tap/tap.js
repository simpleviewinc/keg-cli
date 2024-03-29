
module.exports = {
  tap: {
    name: 'tap',
    alias: [ 'taps' ],
    description: 'Keg CLI tap specific tasks',
    example: 'keg tap <command> <options>',
    tasks: {
      ...require('./action'),
      ...require('./attach'),
      ...require('./build'),
      ...require('./container'),
      ...require('./dependencies'),
      ...require('./destroy'),
      ...require('./docker'),
      ...require('./link'),
      ...require('./list'),
      ...require('./log'),
      ...require('./new'),
      ...require('./path'),
      ...require('./package'),
      ...require('./print'),
      ...require('./publish'),
      ...require('./pull'),
      ...require('./push'),
      ...require('./run'),
      ...require('./restart'),
      ...require('./start'),
      ...require('./stop'),
      ...require('./sync'),
      ...require('./unlink'),
    },
  }
}
