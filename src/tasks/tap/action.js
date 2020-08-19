const { syncService } = require('KegUtils/services')
const { DOCKER } = require('KegConst/docker')

/**
 * Runs a sync action on the tap docker container
 * @param {Object} args - arguments passed from the runTask method
 * @param {string} args.command - Initial command being run
 * @param {Array} args.options - arguments passed from the command line
 * @param {Object} args.tasks - All registered tasks of the CLI
 * @param {Object} globalConfig - Global config object for the keg-cli
 *
 * @returns {void}
 */
const action = args => {
  return syncService(
    { ...args, __internal: { ...args.__internal, actionOnly: true } },
    { container: 'tap', ...args.params }
  )
}

module.exports = {
  action: {
    name: 'action',
    alias: [ 'act', 'actions' ],
    inject: true,
    action: action,
    locationContext: DOCKER.LOCATION_CONTEXT.CONTAINERS,
    description: `Sync a local folder into the tap docker container`,
    example: '',
    options: {
      dependency: {
        alias: [ 'act', 'action', 'actions', 'dep' ],
        description: 'Name of the action to run in the taps docker container',
        required: true
      },
      tap: { 
        description: 'Name of the tap to run. Must be a tap linked in the global config',
        example: 'keg tap start --tap events-force',
        required: true,
      },
    }
  }
}