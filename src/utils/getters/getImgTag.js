const { isStr } = require('@keg-hub/jsutils')
const { getSetting } = require('../globalConfig/getSetting')
const { getContainerConst } = require('../docker/getContainerConst')

/**
 * Gets a tag from the passed in tag param, image, contextEnvs, or the globalConfig default
 * @function
 * @param {string} tag - custom tag to use for a docker image
 * @param {string} context - Current context of the task being run
 * @param {string} [image=''] - Name of the docker image to get the tag for
 *
 * @returns {string} - Found image tag
 */
const getImgTag = (tag, context, image) => {
  return tag ||
    (isStr(image) && image.includes(':') && image.split(':')[1]) ||
    getContainerConst(context, 'env.keg_image_tag', getSetting('docker.defaultTag'))
}

module.exports = {
  getImgTag
}