const { DOCKER } = require('KegConst/docker')
const { runInternalTask } = require('KegUtils/task/runInternalTask')
const { mergeTaskOptions } = require('KegUtils/task/options/mergeTaskOptions')

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
  const { params:{ tap, context } } = args
  
  // Determine the location context base in if a tap is defined
  // It no tap is defined, then the task was called directly, and not with a linked tap
  // Like this => keg tap build
  // NOT like this => keg "link-tap-name" build
  const locationContext = tap ? DOCKER.LOCATION_CONTEXT.REPO : DOCKER.LOCATION_CONTEXT.CONTAINERS

  return runInternalTask('tasks.docker.tasks.build', {
    ...args,
    __internal: {
      ...args.__internal,
      locationContext,
    },
    params: {
      ...args.params,
      // If a tap is defined, then use the original context
      // Otherwise use the default 'tap' context
      context: tap ? context : 'tap',
    },
  })

}

module.exports = {
  build: {
    name: 'build',
    alias: [ 'bld', 'make' ],
    inject: true,
    action: buildTap,
    locationContext: DOCKER.LOCATION_CONTEXT.REPO,
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