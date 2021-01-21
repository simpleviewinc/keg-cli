const { DOCKER } = require('KegConst/docker')
const { runInternalTask } = require('KegUtils/task/runInternalTask')
const { mergeTaskOptions } = require('KegUtils/task/options/mergeTaskOptions')

/**
 * Start a tap outside of docker-compose
 * @param {Object} args - arguments passed from the runTask method
 * @param {string} args.command - Initial command being run
 * @param {Array} args.options - arguments passed from the command line
 * @param {Object} args.tasks - All registered tasks of the CLI
 * @param {Object} globalConfig - Global config object for the keg-cli
 *
 * @returns {void}
 */
const runTap = async (args) => {
  const exArgs = { context: 'tap', tap: args.params.tap, image: 'tap' }
  // TODO: validate this uses the KEG_IMAGE_FROM env when running
  // Should not need to build the tap image first
  // Should just pull the KEG_IMAGE_FROM image from the provider
  return runService(args, { ...exArgs, container: 'tap' }) 
}
module.exports = {
  run: {
    name: 'run',
    alias: [ 'st' ],
    action: runTap,
    inject: true,
    locationContext: DOCKER.LOCATION_CONTEXT.REPO,
    description: `Runs a tap image directly`,
    example: 'keg tap run <options>',
    options: mergeTaskOptions('core', 'run', 'run', {}, ['tap'])
  }
}