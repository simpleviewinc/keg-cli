const { runService } = require('KegUtils/services')
const { DOCKER } = require('KegConst/docker')

/**
 * Run keg-components image outside of docker-compose
 * @param {Object} args - arguments passed from the runTask method
 * @param {string} args.command - Initial command being run
 * @param {Array} args.options - arguments passed from the command line
 * @param {Object} args.tasks - All registered tasks of the CLI
 * @param {Object} globalConfig - Global config object for the keg-cli
 *
 * @returns {void}
 */
const runComponents = async (args) => {
  return runService(args, { context: 'components', tap: undefined })
}

module.exports = {
  run: {
    name: 'run',
    alias: [ 'rn' ],
    action: runComponents,
    inject: true,
    locationContext: DOCKER.LOCATION_CONTEXT.REPO,
    description: `Runs the components image outside of docker-compose`,
    example: 'keg components run <options>',
    options: {
      cleanup: {
        alias: [ 'clean', 'rm' ],
        description: 'Auto remove the docker container after exiting',
        example: `keg components run  --cleanup false`,
        default: true
      },
      options: {
        alias: [ 'opts' ],
        description: 'Extra docker run command options',
        example: `keg components run --options \\"-p 80:19006 -e MY_ENV=data\\"`,
        default: []
      },
      cmd: {
        alias: [ 'entry', 'command' ],
        description: 'Overwrite entry of the image. Use escaped quotes for spaces ( bin/bash )',
        example: 'keg components run --entry \\"node index.js\\"',
        default: '/bin/bash'
      },
      log: {
        description: 'Log the docker run command to the terminal',
        example: 'keg components run --log',
        default: false,
      },
      connect: {
        alias: [ 'conn', 'con', 'it' ],
        description: 'Auto connects to the docker containers stdio',
        example: 'keg docker image run --no-connect',
        default: true
      },
      sync: {
        description: 'Creates a mutagen sync between the local Keg-CLI and the docker container',
        example: 'keg components run --sync false',
        default: false,
      }
    }
  }
}