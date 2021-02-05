const { DOCKER } = require('KegConst/docker')
const { runService } = require('KegUtils/services')
const { mergeTaskOptions } = require('KegUtils/task/options/mergeTaskOptions')

/**
 * Run keg-core image outside of docker-compose
 * @param {Object} args - arguments passed from the runTask method
 * @param {string} args.command - Initial command being run
 * @param {Array} args.options - arguments passed from the command line
 * @param {Object} args.tasks - All registered tasks of the CLI
 * @param {Object} globalConfig - Global config object for the keg-cli
 *
 * @returns {void}
 */
const runCore = async (args) => {
  return runService(args, { context: 'core', tap: undefined })
}

module.exports = {
  run: {
    name: 'run',
    alias: [ 'rn' ],
    action: runCore,
    inject: true,
    locationContext: DOCKER.LOCATION_CONTEXT.REPO,
    description: `Runs the core image outside of docker-compose`,
    example: 'keg core run <options>',
    options: mergeTaskOptions('core', 'run', 'run', {}, [])
  }
}