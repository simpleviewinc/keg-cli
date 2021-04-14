const docker = require('KegDocCli')
const { get, noOpObj, deepMerge } = require('@keg-hub/jsutils')
const { KEG_DOCKER_INSPECT_OPTS } = require('KegConst/constants')
const { runInternalTask } = require('KegUtils/task/runInternalTask')

/**
 * Inspect a taps docker container or image
 * @param {Object} args - arguments passed from the runTask method
 * @param {string} args.command - Initial command being run
 * @param {Array} args.options - arguments passed from the command line
 * @param {Object} args.tasks - All registered tasks of the CLI
 * @param {Object} globalConfig - Global config object for the keg-cli
 *
 * @returns {void}
 */
const dockerInspect = async args => {
  const { params } = args
  const { tap, type, key, __injected=noOpObj } = params
  const inspectType = KEG_DOCKER_INSPECT_OPTS[type]

  const context = __injected[inspectType] ||
    __injected.container ||
    __injected.image ||
    tap

  return await runInternalTask(
    'docker.tasks.inspect',
    deepMerge(args, { params: { context } })
  )
}

module.exports = {
  inspect: {
    name: 'inspect',
    inject: true,
    alias: [ 'in', 'meta' ],
    action: dockerInspect,
    description: `Runs docker inspect command for a tap`,
    example: 'keg <tap> inspect <options>',
    options: {
      key: {
        description: `Print value from the inspect object found at this key path`,
        example: 'keg <tap> inspect --path config.Labels',
      },
      type: {
        allowed: Object.keys(KEG_DOCKER_INSPECT_OPTS),
        description: `Type of the item to inspect`,
        example: 'keg <tap> inspect --type image',
        default: 'container'
      },
    },
  }
}
