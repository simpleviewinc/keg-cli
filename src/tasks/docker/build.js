const docker = require('KegDocCli')
const { Logger } = require('KegLog')
const { DOCKER } = require('KegConst/docker')
const { buildDockerCmd } = require('KegUtils/docker')
const { throwRequired, throwNoTapLoc, generalError } = require('KegUtils/error')
const { runInternalTask } = require('KegUtils/task/runInternalTask')
const { getImgNameContext } = require('KegUtils/getters/getImgNameContext')
const { mergeTaskOptions } = require('KegUtils/task/options/mergeTaskOptions')
const { buildContainerContext } = require('KegUtils/builders/buildContainerContext')

/**
 * Converts buildArgs param array into an object
 * @function
 * @param {Array} buildArgs - Custom build arguments passed from the command line 
 *
 * @returns {Object} - buildArgs array converted into an object
 */
const createEnvFromBuildArgs = buildArgs => {
  return buildArgs &&
    buildArgs.reduce((buildObj, arg) => {
      const [ key, val ] = arg.split(':')
      const cleanKey = key.trim()
      const cleanVal = val.trim()
      cleanKey && cleanVal && (buildObj[cleanKey] = cleanVal)

      return buildObj
    }, {})
}

/**
 * Builds a docker container so it can be run
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
const dockerBuild = async args => {
  const { globalConfig, __internal={} } = args
  // Check if an internal location context was passed

  // Make a copy of the task, so we don't modify the original
  const task = {
    ...args.task,
    // If it was, update to the task location context to match it
    locationContext: __internal.locationContext || args.task.locationContext
  }

  // Remove container from the params if it exists
  // Otherwise it would cause getContext to fail
  // Because it thinks it needs to ask for the non-existent container
  const { container, from, ...params } = args.params
  const { context, log, pull, buildArgs, push } = params

  // Ensure we have a content to build the container
  !context && throwRequired(task, 'context', task.options.context)

  // Get the context data for the command to be run
  const containerContext = await buildContainerContext({
    ...args,
    task,
    params
  })

  const {
    tap,
    image,
    location,
    cmdContext,
    contextEnvs,
  } = containerContext

  // If using a tap, and no location is found, throw an error
  cmdContext === 'tap' && tap && !location && throwNoTapLoc(globalConfig, tap)

  // Use the from option if passed, or the KEG_BASE_IMAGE to get the build image context
  const { full } = await getImgNameContext({ from: from || contextEnvs.KEG_BASE_IMAGE })

  // Build the docker build command
  const dockerCmd = await buildDockerCmd({
    ...args,
    containerContext,
    params: {
      ...params,
      location,
      cmd: `build`,
      context: cmdContext,
      buildArgs: {
        ...contextEnvs,
        ...(buildArgs && createEnvFromBuildArgs(buildArgs)),
        // Ensure the KEG_BASE_IMAGE env uses the passed in from option or the KEG_BASE_IMAGE
        KEG_BASE_IMAGE: full || contextEnvs.KEG_BASE_IMAGE,
      },
      ...(tap && { tap }),
      ...(image && { image }),
    }
  })

  Logger.pair(`\nBuilding docker image`, image || cmdContext)

  const buildImg = image || cmdContext || contextEnvs.IMAGE
  
  // Run the built docker command
  const exitCode = await docker.build(
    dockerCmd,
    { log, options: { env: contextEnvs }, context: buildImg },
    location
  )

  // Exit code is 0 if build succeeds, so check if it exists
  // If if dose then the build failed
  if(exitCode) process.exit(exitCode)

  // Return the built image as a json object
  // This is needed for internal keg-cli calls
  const imgRef = await docker.image.get(buildImg)
  !imgRef && generalError(`Docker image ${buildImg} could not be found after it was built!`)

  // push the new image to the docker provider 
  push && await runInternalTask(
    'tasks.docker.tasks.provider.tasks.push',
    {
      ...args,
      command: 'push',
      __internal: {
        ...args.__internal,
        imgRef,
        containerContext,
      },
      params: {
        ...params,
        context,
        // Force set build false, cause we just built the image
        build: false,
        tag: imgRef.tag,
        image: imgRef.rootId,
      }
    }
  )

  return imgRef
}

module.exports = {
  build: {
    name: 'build',
    alias: [ 'bld', 'b' ],
    action: dockerBuild,
    description: `Runs docker build command for a container`,
    example: 'keg docker build <options>',
    locationContext: DOCKER.LOCATION_CONTEXT.REPO,
    options: mergeTaskOptions(`docker`, `build`, `build`)
  }
}