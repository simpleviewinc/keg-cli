const path = require('path')
const docker = require('KegDocCli')
const { Logger } = require('KegLog')
const { DOCKER } = require('KegConst/docker')
const { throwRequired, generalError } = require('KegUtils/error')
const { buildContainerContext } = require('KegUtils/builders/buildContainerContext')
const { getImgNameContext } = require('KegUtils/getters/getImgNameContext')

/**
 * Tag options for tag and remove tag tasks
 * @Object
 */
const tagOpts = {
  context: {
    alias: ['name'],
    description: 'Context or name of the image to tag',
    example: 'keg docker image tag --context core',
    enforced: true,
  },
  tag: {
    description: 'Tag to add to the image',
    example: 'keg docker image tag --tag my-tag',
    enforced: true
  },
  name: {
    description: 'New name for the image. Overrides provider option',
    example: 'keg docker image tag my-tag --name new-image-name',
  },
  provider: {
    alias: ['pro'],
    description: 'Include the provider information when tagging the image',
    example: 'keg docker image tag --no-full',
    default: true
  },
  log: {
    description: 'Log the docker tag command',
    example: 'keg docker image tag --no-log',
    default: true
  },
}

/**
 * Run a docker image tag command
 * @function
 * @param {Object} args - arguments passed from the runTask method
 * @param {string} args.command - Initial command being run
 * @param {Array} args.options - arguments passed from the command line
 * @param {Object} args.tasks - All registered tasks of the CLI
 * @param {Object} globalConfig - Global config object for the keg-cli
 *
 * @returns {void}
 */
const dockerTag = async args => {
  const { command, params, task } = args
  const { context, remove, name, log } = params

  // Ensure we have a content to build the container
  !context && throwRequired(task, 'context', task.options.context)

  // Don't pass the provider to imageNameContext method
  // Otherwise it will be included when parsing the image name
  const { provider, ...imgContextParams } = params
  const { providerImage, tag, image } = await getImgNameContext(imgContextParams)

  // If remove is passed, then call the removeTag method
  // Otherwise call the tag method
  const tagMethod = remove ? docker.image.removeTag : docker.image.tag

  // If we have an image, call the tag method, otherwise throw no image error
  image
    ? await tagMethod({
        log,
        item: image,
        provider: name ? false : provider,
        tag: name ? `${name}:${tag}` : tag,
      })
    : generalError(`Could not find image to tag for context "${ context }"`)

  log && Logger.info(`Finished updating docker image tags for "${ context }"`)
}

/**
 * Run a docker image remove tag command
 * Calls the dockerTag method, but injects remove: true into the params
 * @Object
 */
const removeTag = {
  remove: {
    name: 'remove',
    alias: [ 'rm', 'delete', 'del' ],
    description: 'Removes a tag from an image',
    options: tagOpts,
    action: args => dockerTag({ ...args, params: { ...args.params, remove: true }}),
  }
}

module.exports = {
  tag: {
    name: 'tag',
    alias: [ 't' ],
    action: dockerTag,
    description: `Runs docker image tag`,
    example: 'keg docker image tag <options>',
    tasks: {
      ...removeTag,
    },
    options: tagOpts,
  }
}
