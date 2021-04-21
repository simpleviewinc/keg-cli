const docker = require('KegDocCli')
const { Logger } = require('KegLog')
const { DOCKER } = require('KegConst/docker')
const { CONTEXT_TO_CONTAINER } = require('KegConst/constants')
const { getCommitTag } = require('KegUtils/package/getCommitTag')
const { throwRequired, generalError } = require('KegUtils/error')
const { runInternalTask } = require('KegUtils/task/runInternalTask')
const { runBuildAction } = require('KegUtils/package/runBuildAction')
const { getImgNameContext } = require('KegUtils/getters/getImgNameContext')
const { get, noOpObj } = require('@keg-hub/jsutils')
const { imageFromContainer } = require('KegUtils/package/imageFromContainer')
const { mergeTaskOptions } = require('KegUtils/task/options/mergeTaskOptions')
const { buildContainerContext } = require('KegUtils/builders/buildContainerContext')

/**
 * Gets the container context object containing the container id and repo location
 * Ensures the id exists within the context object
 * @function
 * @param {Object} args - arguments passed from the runTask method
 *
 * @returns {Object} - containerContext object with id
 */
const getResolvedContext = async args => {
  // Get the context data for the command to be run
  const containerContext = await buildContainerContext(args)
  const { cmdContext, image } = containerContext
  // TODO: This should not be using the image name for finding the image
  // Really the ID should be coming from buildContainerContext
  // Need to investigate why

  // Ensure we get the container context, either from the existing container context
  // Or from the container context for internal apps, or the image name
  const resolvedContainerContext = containerContext.id
    ? containerContext
    : await docker.container.get(CONTEXT_TO_CONTAINER[cmdContext] || image)

  const id = get(resolvedContainerContext, 'id')
  
  !resolvedContainerContext.id &&
    generalError(
      `Container context id is not available. Are you sure the container "${image}" exists?`
    )

  return { ...containerContext, id: resolvedContainerContext.id }
}

/**
 * Gets the correct image tags to be used to when creating the image
 * @function
 * @param {Object} params - Formatted options as an object
 * @param {string} location - Location of the repo the image is being created from
 * @param {string} tag - Custom tag to override the default tags
 *
 * @returns {Object} - Contains the image tags to use when creating
 */
const getImgTags = async (params, location) => {
  const overrideTag = get(params, 'tag', get(params, 'tags', [])[0])

  // Get passed in tag, or the first tag from tags array or branch name at the location
  const tag = overrideTag || await getCommitTag(location)
  // If none found, use the current time
  const commitTag = (tag || 'package-' + Date.now()).toLowerCase()

  // Get the imgNameContext, with the custom commitTag
  const imgNameContext = await getImgNameContext({ ...params, tag: commitTag })

  // Check if the image already exist
  // So we can ask if it should be replaced
  // Also clean it so it can be used as a url with keg-proxy
  const cleanedTag = imgNameContext.tag
    .toLowerCase()
    .replace(/[&\/\\#, +()$~%.'"*?<>{}]/g, '-')

  const imgWTag = `${imgNameContext.providerImage}:${cleanedTag}`

  return { imgWTag, cleanedTag, commitTag }
}

/**
 * Pushes the new image created by docker commit, to the docker provider
 * @function
 * @param {Object} args - arguments passed from the runTask method
 * @param {string} image - Name of the image to be pushed
 * @param {string} imgWTag - Image and Tag joined as a string
 * @param {string} cleanedTag - Tag without the image name attached
 *
 * @returns {void}
 */
const pushImageToProvider = async (args, { image, imgWTag, commitTag }, log) => {
  log && Logger.highlight(`Pushing image`,`"${ imgWTag }"`,`to provider ...`)

  await runInternalTask(
    'tasks.docker.tasks.provider.tasks.push',
    {
      ...args,
      command: 'push',
      params: {
        ...args.params,
        image,
        build: false,
        tag: commitTag,
      }
    }
  )

}

/**
 * Packages a docker container to be deployed to a docker providerCan 
 * @function
 * @param {Object} args - arguments passed from the runTask method
 * @param {string} args.command - Initial command being run
 * @param {Array} args.options - arguments passed from the command line
 * @param {Object} args.tasks - All registered tasks of the CLI
 * @param {Object} args.task - The current task being run
 * @param {Object} args.params - Formatted options as an object
 * @param {Object} globalConfig - Global config object for the keg-cli
 *
 * @returns {Object} - Build image as a json object
 */
const dockerPackage = async args => {

  const { params, __internal=noOpObj } = args
  const { action, author, context, message, push, } = params

  const log = __internal.skipLog ? false : params.log

  // Ensure we have a context to build the container
  !context && throwRequired(args.task, 'context', args.task.options.context)

  /* ---- Step 1: Get the container / image context info ---- */
  const { contextEnvs, location, image, id } = await getResolvedContext(args)

  /* ---- Step 2: Get the the image tags ---- */
  const { imgWTag, cleanedTag, commitTag } = await getImgTags(params, location)

  log && Logger.spacedMsg(`Creating docker package for ${imgWTag}...`)

  /* ---- Step 3: Build the production app bundle for non-dev environments ---- */
  action &&
    await runBuildAction(id, args, {
      action,
      location,
      container: id,
      envs: contextEnvs,
    }, true)

  log && Logger.log(`Creating image from container ( ${id} )`)

  /* ---- Step 4: Create image of the container using docker commit ---- */
  const imageCreated = await imageFromContainer({
    id,
    log,
    author,
    imgWTag,
    message,
    cleanedTag,
  })

  /* ---- Step 5: Push docker image to docker provider registry ---- */
  push &&
    imageCreated &&
    await pushImageToProvider(args, {
      image,
      imgWTag,
      commitTag
    }, log)

  log && Logger.success(`Finished running docker package task!\n`)

  // Return true so we know the image was pushed successfully
  // We should only get here if all above steps are successful
  // If they fail, they should throw
  return true
}

module.exports = {
  package: {
    name: 'package',
    alias: [ 'dpg', 'pack', 'pk' ],
    action: dockerPackage,
    description: `Packages a docker container for deploying to a docker provider`,
    example: 'keg docker package <options>',
    locationContext: DOCKER.LOCATION_CONTEXT.REPO,
    tasks: {
      ...require('./run'),
    },
    options: mergeTaskOptions(`docker`, `package`, `push`, {
      push: {
        description: 'Push the packaged image up to a docker provider registry',
        example: `keg docker package --no-push`,
        default: true,
      },
    })
  }
}
