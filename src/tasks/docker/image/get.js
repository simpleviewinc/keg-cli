const docker = require('KegDocCli')
const { Logger } = require('KegLog')
const { get } = require('@keg-hub/jsutils')
const { DOCKER } = require('KegConst/docker')
const { dockerLog } = require('KegUtils/log/dockerLog')
const { getImageRef } = require('KegUtils/docker/getImageRef')
const { throwNoDockerImg } = require('KegUtils/error/throwNoDockerImg')
const { getImgNameContext } = require('KegUtils/getters/getImgNameContext')

/**
 * Get a docker image object
 * @param {Object} args - arguments passed from the runTask method
 * @param {string} args.command - Initial command being run
 * @param {Array} args.options - arguments passed from the command line
 * @param {Object} args.tasks - All registered tasks of the CLI
 * @param {Object} globalConfig - Global config object for the keg-cli
 *
 * @returns {void}
 */
const getImage = async args => {
  const { params, __internal={} } = args

  // Get the name context based on the params
  const imgNameContext = __internal.imgNameContext || getImgNameContext(params)

  // Get the image reference from the imgNameContext
  const foundImg = await getImageRef(imgNameContext)

  // Ensure we found the image
  !foundImg.imgRef && throwNoDockerImg(null, `The docker "image get" task requires a name or tag argument!`)

  // Log the output of the command
  __internal.skipLog !== true && Logger.data(foundImg.imgRef)

  return foundImg

}

module.exports = {
  get: {
    name: 'get',
    alias: [ 'gt', 'g' ],
    action: getImage,
    description: `Get docker image by name or id`,
    example: 'keg docker image get <options>',
    options: {
      context: {
        alias: [ 'name' ],
        description: 'Context, name or id of the image to get, optionally with the tag.',
        example: 'keg docker image get --name core:0.1.4 ( tag optional )',
        required: true,
      },
      tag: {
        description: 'Tag name of the image to get',
        example: 'keg docker image get --tag <tag name>',
      }
    },
  }
}
