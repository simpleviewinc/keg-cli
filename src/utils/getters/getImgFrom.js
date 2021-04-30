const { get, noOpObj } = require('@keg-hub/jsutils')
const { getContainerConst } = require('KegUtils/docker/getContainerConst')


/**
 * Gets the image to use as the KEG_FROM_IMAGE env based on params context envs, or the image name
 * @function
 * @param {string} image - Found image from
 * @param {string} tag - custom passed in tag
 * @param {Object} [contextEnvs={}] - loaded ENVs based on the context
 *
 * @returns {string} - Found fromImage with fromTag
 */
const checkImgTag = (image, tag, contextEnvs) => {
  // If image already has the tag, then use it
  if(image && image.includes(':')) return image

  // Try to get the tag from params, or ENV
  const imgTag = tag || get(contextEnvs, 'KEG_IMAGE_TAG')

  // If there's a tag use it; otherwise just return the image
  return imgTag ? `${image}:${imgTag}`.trim() : image
}

/**
 * Gets the image to use as the KEG_FROM_IMAGE env based on params context envs, or the image name
 * @function
 * @param {Object} [params={}] - Parsed options passed in from the command line
 * @param {Object} [contextEnvs={}] - loaded ENVs based on the context
 * @param {string} context - The image or context to get the fromImage for
 *
 * @returns {string} - Found from image
 */
const getImgFrom = (params=noOpObj, contextEnvs=noOpObj, context) => {
  context = context ||
    get(params, `__injected.tap`) ||
    get(params, 'cmdContext') ||
    get(params, 'context')
  
  const fromImg = get(params, 'from') || get(contextEnvs, 'KEG_IMAGE_FROM')

  const foundImgFrom = fromImg || !context
    ? fromImg
    : getContainerConst(
        context,
        `env.keg_image_from`,
        getContainerConst(context, `env.image`, context)
      )

  return checkImgTag(foundImgFrom, params.tag, contextEnvs)
}

module.exports = {
  getImgFrom
}
