const { packageService } = require('KegUtils/services/packageService')
const { DOCKER } = require('KegConst/docker')
const { mergeTaskOptions } = require('KegUtils/task/options/mergeTaskOptions')

/**
 * Package a running tap container into an image and push to the docker provider
 * @param {Object} args - arguments passed from the runTask method
 * @param {string} args.command - Initial command being run
 * @param {Array} args.options - arguments passed from the command line
 * @param {Object} args.tasks - All registered tasks of the CLI
 * @param {Object} globalConfig - Global config object for the keg-cli
 *
 * @returns {void}
 */
const packageRun = async args => {
  const { params } = args

  const packageRes = await packageService(
    args,
    { context: 'tap', container: 'tap', tap: params.tap, service: 'run' }
  )

  return packageRes
}

module.exports = {
  run: {
    name: `run`,
    alias: [ 'rn' ],
    inject: true,
    action: packageRun,
    locationContext: DOCKER.LOCATION_CONTEXT.REPO,
    description: `Package a running tap container into an image and push to the docker provider`,
    example: 'keg tap package run <options>',
    options: mergeTaskOptions(`keg tap package`, 'run', 'run', {
      package: {
        description: 'Pull request package url or name',
        example: `keg docker package --package lancetipton/keg-core/keg-core:bug-fixes`,
        required: true,
        ask: {
          message: 'Enter the docker package url or path (<user>/<repo>/<package>:<tag>)',
        }
      },
      command: {
        default: undefined
      },
      tap: { 
        description: 'Name of the tap to run. Must be a tap linked in the global config',
        example: 'keg tap package run --tap my-tap',
        required: true,
      },
    })
  }
}
