const { runService } = require('KegUtils/services')
const { DOCKER } = require('KegConst/docker')
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
const runBase = async (args) => {
  return runService(args, { context: 'base', tap: undefined })
}

module.exports = {
  run: {
    name: 'run',
    alias: [ 'start', 'st' ],
    action: runBase,
    inject: true,
    locationContext: DOCKER.LOCATION_CONTEXT.REPO,
    description: `Runs the base image directly`,
    example: 'keg base run <options>',
    options: mergeTaskOptions('base', 'run', 'run', {}, []),
  }
}