const { get } = require('@keg-hub/jsutils')
const { runInternalTask } = require('KegUtils/task/runInternalTask')

/**
 * Builds or gets the image if args.params.build is false
 * @param {Object} args - arguments passed from the runTask method
 * @param {Object} args.params - Parsed command line options as an object
 * @param {boolean} args.params.build - Should the docker image be built for the context
 *
 * @returns {Object} - Docker API image reference object
 */
const getOrBuildImage = async args => {
  return get(args, 'params.build')
    ? runInternalTask('tasks.docker.tasks.build', { ...args, command: 'build' })
    : runInternalTask('tasks.docker.tasks.image.tasks.get', {
        ...args,
        command: 'get',
        __internal: {
          ...args.__internal,
          skipLog: true,
        },
      })
}

module.exports = {
  getOrBuildImage
}
