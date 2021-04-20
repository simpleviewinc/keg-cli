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
 * @param {string} params.imgTag - Image and Tag joined as a string
 * @param {string} params.message - Message to add to the image when it's created
 * @param {string} params.cleanedTag - Tag without the image name attached
 * @param {string} params.globalConfig - Keg-CLI global config object
 *
 * @returns {void}
 */
const imageFromContainer = async params => {
  const {
    id,
    author,
    imgTag,
    message,
    cleanedTag,
    globalConfig,
  } = params

  const exists = await checkReplaceImage(imgTag, cleanedTag)
  if(exists) return Logger.highlight(`Skipping image commit!`)

  Logger.highlight(`Creating image of container with tag`, `"${ imgTag }"`, `...`)

  await docker.container.commit({
    tag: imgTag,
    container: id,
    message: message,
    author: getAuthor(globalConfig, author),
  })

  Logger.info(`Finished creating image!`)
}

module.exports = {
  containerToImage
}