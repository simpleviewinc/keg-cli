const docker = require('KegDocCli')
const { isBool } = require('@keg-hub/jsutils')
const { getImgNameContext } = require('../getters/getImgNameContext')
const { generalError } = require('../error/generalError')

/**
 * Checks if a docker image already exists locally
 * @function
 * @param {string} params.context - Context or name of the container to check
 * @param {string} params.image - Name of image to check for
 * @param {string} params.tag - Tag of image to check for
 *
 * @returns {Boolean} - If the docker image exists
 */
const checkImageExists = async params => {
  const { context, image, tag } = params

  // Use the image or the context
  const searchFor = image || context
  // If no image or context then throw
  !searchFor && generalError(`checkImageExists util requires a context or image argument!`)

  // Get the image name context,
  // So we can search for the image with tag and the full provider
  const { imageWTag, providerImage } = await getImgNameContext(params)

  let exists = await docker.image.get(imageWTag)

  exists = exists || await docker.image.get(providerImage)

  return Boolean(exists) ? exists : false
}

module.exports  = {
  checkImageExists
}