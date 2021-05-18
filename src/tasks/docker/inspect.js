const docker = require('KegDocCli')
const { Logger } = require('KegLog')
const { ask } = require('@keg-hub/ask-it')
const { DOCKER } = require('KegConst/docker')
const { get, noOpObj } = require('@keg-hub/jsutils')
const { imageSelect } = require('KegUtils/docker/imageSelect')
const { throwRequired, generalError } = require('KegUtils/error')
const { containerSelect } = require('KegUtils/docker/containerSelect')
const { getImgNameContext } = require('KegUtils/getters/getImgNameContext')

/**
 * Ask the user if they want to inspect an image or container
 * @function
 * @private
 * @param {Object} params - Type
 * @param {string} params.type - Type of docker item to inspect
 * @param {boolean} params.container - Should inspect a docker container
 * @param {boolean} params.image - Should inspect a docker image
 *
 * @returns {string} - Type of docker item to inspect
 */
const getInspectType = async ({ type, container, image }) => {
  const inspectType = type || (container && 'container') || (image && 'image')
  if(inspectType) return inspectType

  const inspectTypes = [ 'container', 'image' ]
  const index = await ask.promptList(
    inspectTypes,
    'Select a docker item type to inspect',
  )

  return inspectTypes[index]
}

/**
 * Ask the user to select the item to inspect based on the passed in type
 * @function
 * @private
 * @param {string} type - Type of item to inspect (image or container )
 *
 * @returns {string} - Docker id of the item to inspect
 */
const getInspectItem = async type => {
  const item = type === 'container'
    ? await containerSelect()
    : await imageSelect()

  return item.id
}

/**
 * Calls the docker.container.inspect method passing in the container ref
 * @function
 * @private
 * @param {string} context - Name or reference of the container to call docker inspect on
 *
 * @returns {Object} - Docker inspect object
 */
const inspectContainer = async context => {
  return await docker.container.inspect({ item: context })
}

/**
 * Calls the docker.image.inspect method passing in the image ref
 * @function
 * @private
 * @param {string} context - Name or reference of the image to call docker inspect on
 *
 * @returns {Object} - Docker inspect object
 */
const inspectImg = async context => {
  // Ensure we have the full url of the image
  const { imageWTag } = await getImgNameContext({ context })

  // Get the id of the image, so we can use that for inspecting instead of the url
  // This allows inspecting all images, even ones without the provider url
  const { id } = await docker.image.get(imageWTag)

  return await docker.image.inspect({ item: id || imageWTag })
}

/**
 * Execute a docker inspect command for a container or image
 * @function
 * @param {Object} args - arguments passed from the runTask method
 * @param {string} args.command - Initial command being run
 * @param {Array} args.options - arguments passed from the command line
 *
 * @returns {void}
 */
const dockerInspect = async args => {
  const { params, __internal=noOpObj } = args
  const { key } = params

  const inspectType = await getInspectType(params)
  const context = params.context || await getInspectItem(inspectType)

  // Ensure we have a context to be inspected
  !context && throwRequired(task, 'context', task.options.context)

  const inspectObj = inspectType === 'container'
    ? await inspectContainer(context)
    : await inspectImg(context)

  !inspectObj &&
    generalError(`Could not find ${inspectType} to inspect for context ${context}`)


  const item = key ? get(inspectObj, key) : inspectObj
  !__internal.skipLog && Logger.log(item)

  return item
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
        example: 'keg docker inspect --context proxy --key config.Labels',
      },
      type: {
        allowed: [ 'container', 'image' ],
        description: `Type of the item to inspect`,
      },
      container: {
        alias: [ 'cont', 'cnt', 'ct' ],
        description: `Inspect a docker container. Same as passing "--type container" option`,
      },
      image: {
        alias: [ 'img', 'im' ],
        description: `Inspect a docker container. Same as passing "--type image" option`,
      },
    }
  }
}