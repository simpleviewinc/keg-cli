const docker = require('KegDocCli')
const { Logger } = require('KegLog')
const { ask } = require('KegRepos/ask-it')
const { get, isObj, noOpObj } = require('@keg-hub/jsutils')
const { getImageRef } = require('KegUtils/docker/getImageRef')
const { generalError } = require('KegUtils/error/generalError')
const { runInternalTask } = require('KegUtils/task/runInternalTask')
const { throwNoDockerImg } = require('KegUtils/error/throwNoDockerImg')
const { getImgNameContext } = require('KegUtils/getters/getImgNameContext')
const { isValidProviderUrl } = require('KegUtils/helpers/isValidProviderUrl')
const { mergeTaskOptions } = require('KegUtils/task/options/mergeTaskOptions')

/**
 * Gets the docker image to be pushed to the provider
 * @param {Object} args - arguments passed from the runTask method
 *
 * @returns {Promise<Object> - Docker Image ref}
 */
const checkBuildImage = async (args, imgNameContext, build) => {
  let doBuild = build

  if(!doBuild){
    Logger.info(`\nThe ${imgNameContext.imageWTag} image could not be found.\n`)
    doBuild = await ask.confirm(`Would you like to build it?`)
  }

  // If we should build, call the internal build task 
  if(doBuild)
    return runInternalTask('tasks.docker.tasks.build', {
      ...args,
      command: 'build',
      __internal: {
        ...args.__internal,
        imgNameContext,
        rootTask: 'pull',
      }
    })

  // Log and exit, if no image to push
  Logger.warn(`\nNo Image exists to push to provider. User canceled!\n`)
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
  const { __internal=noOpObj, task } = args
  const { log=true, from, build, ...params } = args.params

  /*
  * ----------- Step 1 ----------- *
  * Get the Image name context and inspect meta data
  */
  const imgNameContext = __internal.imgNameContext || await getImgNameContext(params)
  const { imgRef } = isObj(__internal.imgRef) && __internal || await getImageRef(imgNameContext)

  /*
  * ----------- Step 2 ----------- *
  * Ensure we have an image to reference
  */
  const imageRef = build || !imgRef
    ? await checkBuildImage(args, imgNameContext, build)
    : imgRef

  !imageRef && throwNoDockerImg(imgNameContext.full)

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