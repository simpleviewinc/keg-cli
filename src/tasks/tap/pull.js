const { pullService } = require('KegUtils/services/pullService')
const { mergeTaskOptions } = require('KegUtils/task/options/mergeTaskOptions')
const { updateLocationContext } = require('KegUtils/helpers/updateLocationContext')
const { get } = require('@keg-hub/jsutils')

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
  const updatedArgs = updateLocationContext(args, {
    params: {
      context: 'tap',
      tag: tag || version || branch,
      tap: get(args, 'params.tap') || 'tap',
    }
  })

  return pullService({
    ...args,
    params: updatedArgs.params,
    __internal: {
      ...args.__internal,
      forcePull: true
    },
  })

}
module.exports = {
  pull: {
    name: 'pull',
    alias: [ 'pl' ],
    action: pullTap,
    inject: true,
    description: `Pull a tap image from a docker provider`,
    example: 'keg tap pull <options>',
    options: mergeTaskOptions(`tap`, `pull`, `pull`)
  }
}