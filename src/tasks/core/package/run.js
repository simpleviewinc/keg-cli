const { packageService } = require('KegUtils/services/packageService')
const { DOCKER } = require('KegConst/docker')

/**
 * Run a keg-core container pulled from a docker provider
 * @param {Object} args - arguments passed from the runTask method
 * @param {string} args.command - Initial command being run
 * @param {Array} args.options - arguments passed from the command line
 * @param {Object} args.tasks - All registered tasks of the CLI
 * @param {Object} globalConfig - Global config object for the keg-cli
 *
 * @returns {void}
 */
const packageRun = async args => {
  // TODO: update this to work with just an image tag
  return packageService(
    args,
    { context: 'core', container: 'keg-core', service: 'run', tap: undefined }
  )
}

module.exports = {
  run: {
    name: `run`,
    alias: [ 'rn' ],
    inject: true,
    action: packageRun,
    locationContext: DOCKER.LOCATION_CONTEXT.REPO,
    description: `Package a running tap container into an image and push to the docker provider`,
    example: 'keg core package run <options>',
    options: {
      package: {
        description: 'Pull request package url or name',
        example: `keg core package run --package simpleviewinc/my-app:bug-fixes`,
        required: true,
        ask: {
          message: 'Enter the docker package url or path (<user>/<repo>/<package>:<tag>)',
        }
      },
      command: {
        alias: [ 'cmd' ],
        description: 'Overwrites the default yarn command. Command must exist in package.json scripts!',
        example: 'keg core package run run --command dev ( Runs "yarn dev" )',
        default: false
      },
      tap: { 
        description: 'Name of the tap to run. Must be a tap linked in the global config',
        example: 'keg core package run --tap my-tap',
        required: true,
      },
    }
  }
}