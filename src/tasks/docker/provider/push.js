const docker = require('KegDocCli')
const { Logger } = require('KegLog')
const { ask } = require('@keg-hub/ask-it')
const { get } = require('@keg-hub/jsutils')
const { DOCKER } = require('KegConst/docker')
const { imageSelect } = require('KegUtils/docker/imageSelect')
const { generalError, throwRequired } = require('KegUtils/error')
const { runInternalTask } = require('KegUtils/task/runInternalTask')
const { getOrBuildImage } = require('KegUtils/docker/getOrBuildImage')
const { getImgNameContext } = require('KegUtils/getters/getImgNameContext')
const { isValidProviderUrl } = require('KegUtils/helpers/isValidProviderUrl')
const { mergeTaskOptions } = require('KegUtils/task/options/mergeTaskOptions')

/**
 * Gets the docker image to be pushed to the provider
 * @param {Object} args - arguments passed from the runTask method
 *
 * @returns {Promise<Object> - Docker Image ref}
 */
const checkForImage = async args => {
  // Try to get or build the image
  const imgRef = await getOrBuildImage(args)
  if(imgRef) return imgRef

  // If no image, then ask if the user wants to build it
  const { params: { context, tap } } = args

  Logger.info(`\nThe ${tap || context} image could not be found.\n`)
  const doBuild = await ask.confirm(`Would you like to build it?`)

  // If we should build, call the internal build task 
  if(doBuild)
    return runInternalTask('tasks.docker.tasks.build', {
      ...args,
      command: 'build',
      __internal: { rootTask: 'pull' }
    })

  // Log and exit, if no image to push
  Logger.warn(`\nImage NOT pushed to provider. User canceled!\n`)
  process.exit(0)

}

/**
 * Pushes a local image registry provider in the cloud
 * @param {Object} args - arguments passed from the runTask method
 * @param {string} args.command - Initial command being run
 * @param {Array} args.options - arguments passed from the command line
 * @param {Object} args.tasks - All registered tasks of the CLI
 * @param {Object} args.task - Current task being run
 * @param {Object} args.params - Formatted key / value pair of the passed in options
 * @param {Object} globalConfig - Global config object for the keg-cli
 *
 * @returns {Promise<Void>}
 */
const providerPush = async (args) => {
  const { params, task } = args
  const { context, log=true } = params

  // Ensure we have the context of the image to be pushed
  !context && throwRequired(task, 'context', get(task, `options.context`))

  /*
  * ----------- Step 1 ----------- *
  * Get or build the image
  */
  const imageRef = await checkForImage(args)
  !imageRef && generalError('No img found!')

  /*
  * ----------- Step 2 ----------- *
  * Get the image name context, which will contain the full provider url
  */
  const imgNameContext = await getImgNameContext({ ...params }, imageRef)

  /*
  * ----------- Step 3 ----------- *
  * Validate the full url to allow pushing to a provider the tag it
  */
  !isValidProviderUrl(imgNameContext.full) &&
    generalError(`Failed to push ${imageRef.name}. Provider url is invalid`, imgNameContext.full)

  // Then call command to add the tag to the image
  await docker.image.tag({
    image: imageRef,
    log: true,
    provider: true,
    tag: imgNameContext.full,
  })

  /*
  * ----------- Step 4 ----------- *
  * Finally push the image to docker using the full provider url
  */
  await docker.push(imgNameContext.full)
  
  Logger.success(`\nFinished pushing ${imgNameContext.imageWTag} to provider!\n`)
  
  // Return the image ref incase this task was called internally
  return imageRef
}

module.exports = {
  push: {
    name: 'push',
    alias: [ 'psh' ],
    action: providerPush,
    description: 'Pushes an image to a Docker registry provider',
    example: 'keg docker provider push <options>',
    options: mergeTaskOptions(`docker provider`, `push`, `push`),
  }
}