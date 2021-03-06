const { Logger } = require('KegLog')
const {
  exists,
  isArr,
  isStr,
  isObj,
  isFunc
} = require('@keg-hub/jsutils')

const {
  dockerCli,
  dynamicCmd,
  inspect,
  raw,
  remove,
} = require('./commands')

const {
  buildNames,
  compareItems,
  isDockerId,
  noItemFoundError,
  toContainerEnvs
} = require('./helpers')

/**
 * Calls the docker api and gets a list of current images
 * @function
 * @param {Object} args - arguments used to modify the docker api call
 * @param {string} args.opts - Options used to build the docker command
 * @param {string} args.format - Format of the docker command output
 *
 * @returns {Array} - JSON array of all images
 */
const listImages = (args={}) => {
  const { opts } = args

  return dockerCli({
    format: 'json',
    ...args,
    opts: ['image', 'ls'].concat(
      isArr(opts)
        ? opts
        : isStr(opts)
          ? opts.split(' ')
          : []
    )
  })
}

/**
 * Tags an image with the passed in imgTag
 * @function
 * @param {Object|string} args - Arguments to tag an image || an Image identifier
 * @param {string} args.item - Image identifier; either name or id
 * @param {string} args.tag - Tag to add to the image
 * @param {string} args.log - Log the output of the docker image tag command
 * @param {string} imgTag - Tag to add to the image. Used when args is a string
 *
 * @returns {*} - Output of the docker image tag command
 */
const tagImage = async (args, imgTag) => {

  // Allow calling the tagImage with a string image name and string imgTag
  args = isStr(args) ? { item: args, tag: imgTag } : args

  // Pull the needed params from the args object
  const { item, tag, log, provider } = args

  // Get the image as an object
  let image = isObj(args.image) ? args.image : await getImage(item)

  // If no image is found, then throw
  !image && noItemFoundError('image', image)

  const opts = provider
    ? [ 'tag', image.id, tag ]
    : [ 'tag', image.id, `${image.rootId}:${tag}` ]

  // Add the tag to the image
  return dockerCli({
    ...args,
    opts,
    format: '',
  })
}

/**
 * Un-tags an image with the passed in imgTag
 * @function
 * @param {Object|string} args - Arguments to tag an image || an Image identifier
 * @param {string} args.item - Image identifier; either name or id
 * @param {string} args.tag - Tag to add to the image
 * @param {string} args.log - Log the output of the docker image tag command
 * @param {string} imgTag - Tag to add to the image. Used when args is a string
 *
 * @returns {*} - Output of the docker image tag command
 */
const removeTagImage = async (args, imgTag) => {
  // Allow calling the removeTagImage with a string image name and string imgTag
  args = isStr(args) ? { item: args, tag: imgTag } : args

  // Pull the needed params from the args object
  const { item, tag, log } = args

  // Ensure a tag exists
  if(!tag)
    return Logger.error(`A tag argument is required to be able to remove it`)

  // Get the image as an object
  let image = args.image || await getImage(item)

  // If no image, then just throw
  !image && noItemFoundError('image', image)

  // Use the repository as the name if it's a pull url
  const imgName = image.repository.includes('/') ? image.repository : image.rootId

  return dockerCli({
    ...args,
    format: '',
    opts: [ 'rmi', `${imgName}:${tag}` ]
  })
}

/**
 * Searches current images for a name or id match
 * @function
 * @param {string} nameOrId - Name or id of the image to get
 * @param {function} findCb - Callback to filter images
 * @param {boolean} [log=false] - Should log output
 *
 * @returns {Object} - Found image match
 */
const getImage = async (image, findCb, log=false) => {

  // Split the image and tag if : exits in the image name
  const [ imgName, tag ] = image.includes(':')
    ? image.split(':')
    : [ image ]
  
  // Get all current images
  const images = await listImages({ errResponse: [], format: 'json', log })

  // If we have images, try to find the one matching the passed in argument
  return images &&
    images.length &&
    images.find(image => {
      if(isFunc(findCb)) return findCb(image, imgName, tag)

      if(tag && (image.tag !== tag || !image.tags.includes(tag))) return false

      const hasMatch = image.id === imgName ||
        image.repository === imgName ||
        image.rootId === imgName

      return !hasMatch || (hasMatch && !tag)
        ? hasMatch
        : image.tag === tag || image.tags.includes(tag)
    })
}

/**
 * Gets an images name from it's ID
 * @function
 * @param {string} id - Docker image id
 *
 * @returns {string} - Built image name
 */
const getNameFromId = async id => {
  imgRef = await getImage(id)
  return imgRef && `${imgRef.repository}:${imgRef.tag}`
}

/**
 * Searches current images for a tag match
 * @function
 * @param {string} tag - Tag of the image to get
 *
 * @returns {Object} - Found image match
 */
const getByTag = async (imgRef, log=false) => {
  // Get all current images
  const images = await listImages({ errResponse: [], format: 'json', log })

  // If we have images, try to find the one matching the passed in argument
  return images &&
    images.length &&
    images.find(image => image.tag === imgRef)
}

/**
 * Removes a docker image based on passed in toRemove argument
 * @function
 * @param {string} args - Arguments used in the docker remove command
 *
 * @returns {Promise<string|Array>} - Response from the docker cli command
 */
const removeImage = args => {
  return remove({ ...args, type: 'image' })
} 

/**
 * Checks if an image already exists ( is built )
 * @function
 * @param {string} compare - Value to compare each container with
 * @param {string|function} doCompare - How to compare each container
 * @param {string|function} format - Format of the docker command output
 *
 * @returns {boolean} - Based on if the image exists
 */
const existsImage = async (compare, doCompare, log) => {
  // Get all current images
  const images = await listImages({ errResponse: [], format: 'json', log })

  // If we have images, try to find the one matching the passed in argument
  return images &&
    images.length &&
    images.reduce((found, image) => {
      return found ||
        compareItems(image, compare, doCompare, [ 'id', 'repository' ]) &&
        image
    }, false)

}

/**
 * Removes all un-tagged and un-named images
 * @function
 * @param {string} args - Arguments to pass to the docker image command
 * @param {string} args.opts - Options used to build the docker command
 *
 * @returns {boolean} - If the images can be removed
 */
const clean = async ({ force, opts='', log=false }) => {
  
  const IMG_NONE = `<none>`

  // Get all current images
  const images = await listImages({ errResponse: [], format: 'json', log })

  // Find the images to be removed
  const toRemove = images.reduce((toRemove, image) => {
    (image.repository === IMG_NONE || image.tag === IMG_NONE) &&
      ( toRemove += ` ${ image.id }`)

    return toRemove
  }, '').trim()

  return toRemove && dockerCli({
    force,
    opts: ['image', 'rm'].concat([ toRemove, opts ]),
  })

}

/**
 * Runs a built image as a container
 * @function
 * @param {Object} args - Arguments to pass to run the docker run command
 * @param {string} args.cmd - Overwrite the default cmd of the image
 * @param {Object} args.envs - Envs to pass to the container when run
 * @param {string|Object} args.image - Image object or image name to be run
 * @param {string} args.location - The location where the docker run command will be executed
 * @param {string} args.name - Name of the docker container
 * @param {Array} args.opts - Extra docker cli options to pass to the run command
 * @param {Array} args.ports - Host ports to mount to the container
 *
 * @returns {string|Array} - Response from docker cli
 */
const runImage = async (args) => {
  const {
    cmd,
    entry,
    envs,
    location,
    log,
    name,
    network,
    opts=[],
    ports=[],
    remove,
    tag
  } = args

  const image = isDockerId(args.image)
    ? await getNameFromId(args.image)
    : args.image

  // Build the names for the container and image
  const names = buildNames({ image, name, tag })

  // Set the name of the container based off the image name
  let cmdToRun = `docker run --name ${ names.container }`.trim()

  network && opts.push(`--network ${network}`)
  remove && opts.push(`--rm`)

  isArr(ports) &&
    ports.map(port => (
      port.includes(':') 
        ? opts.push(`-p ${port}`) 
        : opts.push(`-p ${port}:${port}`)
    ))

  // Add any passed in docker cli opts 
  cmdToRun = `${ cmdToRun } ${ opts.join(' ') }`.trim()

  // Convert the passed in envs to envs that can be passed to the container
  cmdToRun = toContainerEnvs(envs, cmdToRun)
  
  // Get the container run command
  const containerCmd = cmd || ''

  // Check for entrypoint override
  cmdToRun = entry ? `${cmdToRun} --entrypoint ${entry}` : cmdToRun

  // Check for command override
  cmdToRun = `${ cmdToRun.trim() } ${ names.image.trim() } ${ containerCmd.trim() }`.trim()

  log && Logger.spacedMsg(`  Running command: `, cmdToRun)

  // Run the command
  return raw(cmdToRun, { options: { env: envs }}, location)

}

/**
 * Gets the last Cmd of a built docker image
 * @function
 * @param {Object} args - Arguments to pass to the docker image command
 * @param {string} args.image - Reference to the docker image
 * @param {string} args.envs - ENVs to pass to the child process
 * @param {string} args.clean - Cleans the returned cmd string 
 * 
 * @param {string} args.location - Location where the docker command should be run
 *
 * @returns {string|Array} - Response from docker cli
 */
const getCmd = async ({ clean, ...args }) => {
  const rawCmd = args.image
    ? await inspectImage({ ...args, parse: false, format: '-f {{.Config.Cmd}}' })
    : Logger.error(`Docker image reference is required to run the image get command method!`) || ''

  const cmd = rawCmd.replace('\n', '')
  if(!clean) return cmd

  const cleaned = cmd[0] === '[' ? cmd.substr(1) : cmd

  // TODO: May need to add `.replace(',', '')` to cleaned.slice(0, -1)
  // This is for cases where the CMD is an array. Need to investigate
  return cleaned[ cleaned.length -1 ] === ']'
    ? cleaned.slice(0, -1)
    : cleaned

}

/**
 * Runs docker image inspect for the passed in image
 * @function
 * @param {Object} args - Arguments to pass to the docker image command
 * @param {string} args.image - Reference to the docker image
 * @param {string} args.item - Alt reference to the docker image
 * @param {boolean} args.parse - Should parse the response into JSON
 * @param {string} [args.format=json] - Format the returned results
 *
 * @returns {string|Object} - Docker image information
 */
const inspectImage = async ({ image, item, ...args }) => {
  return await inspect({
    format: 'json',
    ...args,
    type: 'image',
    item: image || item,
  })
}

/**
 * Root docker image method to run docker image commands
 * @function
 * @param {string} args - Arguments to pass to the docker image command
 *
 * @returns {string|Array} - Response from docker cli
 */
const image = (args={}) => dynamicCmd(args, 'image')

// Add the sub-methods to the root docker image method
Object.assign(image, {
  clean,
  exists: existsImage,
  get: getImage,
  getByTag,
  getCmd,
  inspect: inspectImage,
  list: listImages,
  run: runImage,
  remove: removeImage,
  tag: tagImage,
  removeTag: removeTagImage,
})

module.exports = image
