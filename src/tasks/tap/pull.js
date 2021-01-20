const { DOCKER } = require('KegConst/docker')
const { pullService } = require('KegUtils/services/pullService')
const { mergeTaskOptions } = require('KegUtils/task/options/mergeTaskOptions')

/**
 * Pulls a tap image from a registry provider based on tag
 * @param {Object} args - arguments passed from the runTask method
 * @param {string} args.command - Initial command being run
 * @param {Array} args.options - arguments passed from the command line
 * @param {Object} args.tasks - All registered tasks of the CLI
 * @param {Object} globalConfig - Global config object for the keg-cli
 *
 * @returns {void}
 */
const pullTap = async (args) => {
  const { params: { tap, branch, tag, version }} = args

  return pullService({
    ...args,
    __internal: {
      ...args.__internal,
      forcePull: true
    },
    params: {
      ...args.params,
      tap,
      context: 'tap',
      tag: tag || version || branch
    }
  })

}
module.exports = {
  pull: {
    name: 'pull',
    alias: [ 'pl' ],
    action: pullTap,
    inject: true,
    locationContext: DOCKER.LOCATION_CONTEXT.CONTAINERS,
    description: `Pull a tap image from a docker provider`,
    example: 'keg tap pull <options>',
    options: mergeTaskOptions(`tap`, `pull`, `pull`)
  }
}