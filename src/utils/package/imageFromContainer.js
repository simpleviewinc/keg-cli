const docker = require('KegDocCli')
const { Logger } = require('KegLog')
const { getAuthor } = require('./getAuthor')
const { checkReplaceImage } = require('../docker/checkReplaceImage')

/**
 * Calls the docker commit method to create a new image from a running container
 * If the image already exists, ask the user if it should be replaced
 * @function
 * @param {Object} params - Formatted options as an object
 * @param {string} params.id - Id of the running container
 * @param {string} params.author - Name of the user who's creating the image
 * @param {string} params.imgWTag - Image and Tag joined as a string
 * @param {string} params.message - Message to add to the image when it's created
 * @param {string} params.cleanedTag - Tag without the image name attached
 * @param {string} params.globalConfig - Keg-CLI global config object
 *
 * @returns {boolean} - True if the image was created from the container
 */
const imageFromContainer = async params => {
  const {
    id,
    log,
    author,
    imgWTag,
    message,
    cleanedTag,
    globalConfig,
  } = params

  const exists = await checkReplaceImage(imgWTag, cleanedTag)
  if(exists) return log ? Logger.warn(`\nSkipping image commit!\n`) : false

  await docker.container.commit({
    log,
    tag: imgWTag,
    container: id,
    message: message,
    author: getAuthor(author, globalConfig),
  })

  log && Logger.success(`Finished creating image!\n`)

  return true
}

module.exports = {
  imageFromContainer
}