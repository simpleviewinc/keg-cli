const { DOCKER } = require('KegConst/docker')
const { runInternalTask } = require('KegUtils/task/runInternalTask')
const { mergeTaskOptions } = require('KegUtils/task/options/mergeTaskOptions')
const { updateLocationContext } = require('KegUtils/helpers/updateLocationContext')

/**
 * Builds a docker container for a tap so it can be run
 * @param {Object} args - arguments passed from the runTask method
 * @param {string} args.command - Initial command being run
 * @param {Array} args.options - arguments passed from the command line
 * @param {Object} args.tasks - All registered tasks of the CLI
 * @param {Object} globalConfig - Global config object for the keg-cli
 *
 * @returns {void}
 */
const buildTap = async (args) => {
  return await runInternalTask(
    'tasks.docker.tasks.build',
    updateLocationContext(args, { command: 'build' }),
  )
}

module.exports = {
  build: {
    name: 'build',
    alias: [ 'bld', 'make' ],
    inject: true,
    action: buildTap,
    description: `Builds a taps docker container`,
    example: 'keg tap build <options>',
    options: mergeTaskOptions(`tap`, `build`, `build`, {
      tap: {
        description: 'Name of the tap to build a Docker image for',
        example: 'keg tap build --tap <name-of-linked-tap>',
      }
    })
  }
}