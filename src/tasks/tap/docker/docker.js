
module.exports = {
  docker: {
    name: 'docker',
    alias: [ 'doc', 'd' ],
    description: 'Keg CLI tap docker specific tasks',
    example: 'keg tap docker <command> <options>',
    tasks: {
      ...require('./copy'),
      ...require('./exec'),
      ...require('./inspect'),
    },
  }
}
