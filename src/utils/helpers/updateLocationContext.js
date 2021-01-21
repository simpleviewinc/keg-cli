const { DOCKER } = require('KegConst/docker')
const { deepMerge, noOpObj } = require('@keg-hub/jsutils')

/**
 * Determine the location context base in if a tap is defined
 * <br/>It no tap is defined, then the task was called directly, and not with a linked tap
 * <br/>Like this => keg tap build
 * <br/>NOT like this => keg "link-tap-name" build
 *
 * @param {Object} args - arguments passed from the runTask method
 * @param {string} args.command - Initial command being run
 * @param {Array} args.options - arguments passed from the command line
 * @param {Object} args.tasks - All registered tasks of the CLI
 * @param {Object} globalConfig - Global config object for the keg-cli
 *
 * @returns {Object} - args object with the locationContext updated
*/
const updateLocationContext = (args, exArgs=noOpObj) => {
  const { params:{ tap, context }, task } = args
  // Determine the location context base in if a tap is defined
  // It no tap is defined, then the task was called directly, and not with a linked tap
  // Like this => keg tap build
  // NOT like this => keg "link-tap-name" build
  const locationContext = tap ? DOCKER.LOCATION_CONTEXT.REPO : DOCKER.LOCATION_CONTEXT.CONTAINERS

  // Rebuild the args with the updated locationContext
  return deepMerge({
    ...args,
    // TODO: find all references that use __internal.locationContext
    // Update to use task.locationContext instead
    __internal: { ...args.__internal, locationContext },
    task: { ...task, locationContext },
    // If a tap is defined, then use the original context
    // Otherwise use the default 'tap' context
    params: { ...args.params, context: tap ? context : 'tap' },
  }, exArgs)

}

module.exports = {
  updateLocationContext
}