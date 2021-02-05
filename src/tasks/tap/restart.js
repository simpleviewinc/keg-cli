const { DOCKER } = require('KegConst/docker')
const { restartService } = require('KegUtils/services')
const { mergeTaskOptions } = require('KegUtils/task/options/mergeTaskOptions')

/**
 * Start a tap with docker-compose
 * @param {Object} args - arguments passed from the runTask method
 * @param {string} args.command - Initial command being run
 * @param {Array} args.options - arguments passed from the command line
 * @param {Object} args.tasks - All registered tasks of the CLI
 * @param {Object} globalConfig - Global config object for the keg-cli
 *
 * @returns {void}
 */
const restartTap = async args => {
  const { params: { tap } } = args

  return restartService(args, {
    tap,
    context: 'tap',
    container: 'tap',
  })

}

module.exports = {
  restart: {
    name: 'restart',
    alias: [ 'rest', 'rerun', 'rr', 'rst' ],
    inject: true,
    action: restartTap,
    locationContext: DOCKER.LOCATION_CONTEXT.CONTAINERS,
    description: `Restarts a taps docker containers`,
    example: 'keg tap restart <options>',
    options: mergeTaskOptions('tap', 'restart', 'startService', {
      tap: { 
        description: 'Name of the tap to run. Must be a tap linked in the global config',
        example: 'keg tap restart --tap <tap-name>',
        required: true,
      },
    }),
  }
}