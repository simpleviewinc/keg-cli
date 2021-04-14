const docker = require('KegDocCli')
const { Logger } = require('KegLog')
const { DOCKER } = require('KegConst/docker')
const { throwRequired } = require('KegUtils/error')
const { get, noOpObj } = require('@keg-hub/jsutils')
const { KEG_DOCKER_INSPECT_OPTS } = require('KegConst/constants')
const { getContainerConst } = require('KegUtils/docker/getContainerConst')

/**
 * Execute a docker inspect command
 * @function
 * @param {Object} args - arguments passed from the runTask method
 * @param {string} args.command - Initial command being run
 * @param {Array} args.options - arguments passed from the command line
 *
 * @returns {void}
 */
const dockerInspect = async args => {
  const { params, __internal=noOpObj } = args
  const { context, type, key } = params

  // Ensure we have a content to build the container
  // TODO: add askIt, to ask for container for image is not type || context
  !context && throwRequired(task, 'context', task.options.context)

  let item = docker.isDockerId(context)
    ? context
    : getContainerConst(context, `env.${KEG_DOCKER_INSPECT_OPTS[type]}`)

  item = item || getContainerConst(context, `env.container_name`)
  item = item || getContainerConst(context, `env.image`, context)

  const inspectObj = type
    ? await docker[type].inspect({ item })
    : await docker.inspect({ item })

  if(!inspectObj) return noOpObj

  if(!__internal.skipLog)
    key ? Logger.log(get(inspectObj, key)) : Logger.log(inspectObj)

  return inspectObj
}

module.exports = {
  inspect: {
    name: 'inspect',
    alias: [ 'in', 'meta' ],
    action: dockerInspect,
    description: 'Inspect docker items',
    example: 'keg docker inspect <options>',
    options: {
      context: {
        allowed: DOCKER.IMAGES,
        description: 'Name of the docker container to inspect',
        enforced: true,
      },
      key: {
        description: `Print value from the inspect object found at this key path`,
        example: 'keg docker inspect --context proxy --path config.Labels',
      },
      type: {
        allowed: Object.keys(KEG_DOCKER_INSPECT_OPTS),
        description: `Type of the item to inspect`,
        default: 'container'
      },
    }
  }
}