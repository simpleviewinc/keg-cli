const { deepMerge } = require('@keg-hub/jsutils')
const { runInternalTask } = require('KegUtils/task/runInternalTask')

/**
 * Inspect a taps docker container or image
 * This task does not have `inject: true`, so it can not be overridden from a custom task 
 * @param {Object} args - arguments passed from the runTask method
 * @param {string} args.command - Initial command being run
 * @param {Array} args.options - arguments passed from the command line
 * @param {Object} args.tasks - All registered tasks of the CLI
 * @param {Object} globalConfig - Global config object for the keg-cli
 *
 * @returns {void}
 */
const dockerInspect = async args => {
  return await runInternalTask(
    'docker.tasks.inspect',
    deepMerge(args, { params: { context: args.params.tap } })
  )
}

module.exports = {
  inspect: {
    name: 'inspect',
    alias: [ 'in', 'meta' ],
    action: dockerInspect,
    description: `Runs docker inspect command for a tap`,
    example: 'keg <tap> docker inspect <options>',
    options: {
      type: {
        allowed: [ 'container', 'image' ],
        description: `Type of the item to inspect`,
        example: 'keg <tap> inspect --type container'
      },
      key: {
        description: `Print value from the inspect object found at this key path`,
        example: 'keg <tap> inspect --key config.Labels',
      },
      container: {
        alias: [ 'cont', 'cnt', 'ct' ],
        description: `Inspect a docker container. Same as passing "--type container" option`,
      },
      image: {
        alias: [ 'img', 'im' ],
        description: `Inspect a docker container. Same as passing "--type image" option`,
      },
    },
  }
}
