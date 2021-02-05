const { DOCKER } = require('KegConst/docker')
const { runService } = require('KegUtils/services')
const { mergeTaskOptions } = require('KegUtils/task/options/mergeTaskOptions')

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
    options: mergeTaskOptions('components', 'run', 'run', {}, []),
  }
}