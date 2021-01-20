const { getImgFrom } = require('./getImgFrom')
const { getContainerConst } = require('../docker/getContainerConst')

// TODO: This should be removed

/**
 * Gets the base tag from the KEG_IMAGE_FROM env or the getFromImg helper
 * @function
 * @param {Object} params - Parsed command line options
 * @param {string} cmdContext - The current context of the task being run (core, components, tap)
 *
 * @returns {string} - Found base image tag
 */
const getBaseTag = (params, cmdContext) => {
  const fromImg = getImgFrom(params, getContainerConst(cmdContext, 'env'), cmdContext)
  const fromTag = fromImg && fromImg.includes(':') ? fromImg.split(':')[1] : false

  return fromTag || getSetting('docker.defaultTag')
}


module.exports = {
  getBaseTag
}