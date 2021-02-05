const { get } = require('@keg-hub/jsutils')
const { runService } = require('KegUtils/services')
const { mergeTaskOptions } = require('KegUtils/task/options/mergeTaskOptions')
const { updateLocationContext } = require('KegUtils/helpers/updateLocationContext')

/**
 * Start a tap using docker outside of docker-compose
 * @param {Object} args - arguments passed from the runTask method
 * @param {string} args.command - Initial command being run
 * @param {Array} args.options - arguments passed from the command line
 * @param {Object} args.tasks - All registered tasks of the CLI
 * @param {Object} globalConfig - Global config object for the keg-cli
 *
 * @returns {void}
 */
const runTap = async (args) => {
  const updatedArgs = updateLocationContext(args, {
    params: { tap: get(args, 'params.tap') || 'tap', }
  })

  return await runService(updatedArgs, {
    context: get(updatedArgs, 'params.context'),
    tap: get(updatedArgs, 'params.tap'),
  })

}
module.exports = {
  run: {
    name: 'run',
    alias: [ 'st' ],
    action: runTap,
    inject: true,
    description: `Runs a tap image directly`,
    example: 'keg tap run <options>',
    options: mergeTaskOptions('core', 'run', 'run', {}, ['tap'])
  }
}