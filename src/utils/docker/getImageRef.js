const docker = require('KegDocCli')
const { noOpObj } = require('@keg-hub/jsutils')

/**
 * Calls docker.image.get with the passed in image name
 * @param {string} image - Name of the image to find
 *
 * @returns {Object} - Found docker image reference
 */
const attemptToGetImg = async image => {
  try {
    return docker.image.get(image)
  }
  catch(err){
    return undefined
  }
}

/**
 * Searches for an docker image via different variations from the imageNameContext
 * @param {Object} imgNameContext - Name context for the image we are searching for
 *
 * @returns {Object} - Joined imgRef and exists object
 */
const getImageRef = async imgNameContext => {
  // Try to get the image with full provider url
  const fullRef = await attemptToGetImg(imgNameContext.full)

  if(fullRef) return { imgRef: fullRef, refFrom: imgNameContext.full }

  // Otherwise try to get it with just the name an tag
  const tagRef = await attemptToGetImg(imgNameContext.imageWTag)
  if(tagRef) return { imgRef: tagRef, refFrom: imgNameContext.imageWTag }


  // Otherwise try to get it with just the name an tag
  const imgRef = await attemptToGetImg(imgNameContext.image)
  if(imgRef) return { imgRef, refFrom: imgNameContext.image }

  return noOpObj
}


module.exports = {
  getImageRef
}