const { dockerOptions } = require('./dockerOptions')
const { contextOptions } = require('./contextOptions')

const runOptions = (task, action, options) => {
  return {
    ...contextOptions(task, action, options),
      cleanup: {
        alias: [ 'clean', 'rm' ],
        description: 'Auto remove the docker container after exiting',
        example: `keg ${task} ${action} --no-cleanup`,
        default: true
      },
      options: {
        alias: [ 'opts' ],
        description: 'Extra docker run command options',
        example: `keg ${task} ${action} --options \\"-p 80:19006 -e MY_ENV=data\\"`,
        default: []
      },
      cmd: {
        alias: [ 'entry', 'command' ],
        description: 'Overwrite entry of the image. Use escaped quotes for spaces ( bin/bash )',
        example: `keg ${task} ${action} --entry \\"node index.js\\"`,
        default: '/bin/bash'
      },
      log: {
        description: 'Log the docker run command to the terminal',
        example: `keg ${task} ${action} --log`,
        default: false,
      },
      connect: {
        alias: [ 'conn', 'con', 'it' ],
        description: 'Auto connects to the docker containers stdio',
        example: `keg ${task} ${action} --no-connect`,
        default: true
      },
      network: {
        alias: [ 'net' ],
        description: 'Set the docker run --network option to this value',
        example: 'keg docker package run --network host'
      },
      sync: {
        description: 'Creates a mutagen sync between the local Keg-CLI and the docker container',
        example: `keg ${task} ${action} --sync false`,
        default: false,
      },
      volumes: {
        description: 'Mount the local volumes defined in the docker-compose config.yml.',
        example: `keg ${task} ${action} run --volumes`,
        default: false
      },
      port: {
        description: 'Exposes the port to your local, from the docker container',
        example: `keg ${task} ${action} run --port 5005:5005`,
        default: false
      },
    ...dockerOptions(task, action),
  }
}

module.exports = {
  runOptions
}