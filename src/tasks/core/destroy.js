
const { destroyService } = require('KegUtils/services')

/**
 * Removes all docker items related to keg-core
 * @param {Object} args - arguments passed from the runTask method
 * @param {string} args.command - Initial command being run
 * @param {Array} args.options - arguments passed from the command line
 * @param {Object} args.tasks - All registered tasks of the CLI
 * @param {Object} globalConfig - Global config object for the keg-cli
 *
 * @returns {void}
 */
const destroyCore = async (args) => {
  return destroyService(args, { context: 'core', container: 'kegcore' })
}

module.exports = {
  destroy: {
    name: 'destroy',
    alias: [ 'dest', 'des' ],
    action: destroyCore,
    description: `Destroys the docker items for keg-core`,
    example: 'keg core destroy <options>',
    options: {
      image: {
        description: 'Remove the docker image related to keg-core',
        example: 'keg core destroy --image',
        default: false
      }
    }
  }
}