
const docker = require('KegDocCli')
const { get } = require('@keg-hub/jsutils')
const { KEG_ENVS } = require('KegConst/envs')
const { CONTAINER_PREFIXES } = require('KegConst/constants')
const { CONTAINERS } = require('KegConst/docker/containers')
const { buildContextEnvs } = require('KegUtils/builders/buildContextEnvs')
const { getImgNameContext } = require('KegUtils/getters/getImgNameContext')
const { mergeTaskOptions } = require('KegUtils/task/options/mergeTaskOptions')
const { getImgInspectContext } = require('KegUtils/getters/getImgInspectContext')
const { throwDupContainerName } = require('KegUtils/error/throwDupContainerName')
const { buildContainerContext } = require('KegUtils/builders/buildContainerContext')

// const { removeLabels } = require('KegUtils/docker/removeLabels')
// const { imageSelect } = require('KegUtils/docker/imageSelect')

const { IMAGE } = CONTAINER_PREFIXES


const attemptToGetImg = async image => {
  try {
    return await docker.image.get(image)
  }
  catch(err){
    return undefined
  }
}

/**
 * Called when the container to run already exists
 * Default is to throw an error, unless skipError is true
 * @param {string} container - Name of container that exists
 * @param {Object} exists - Container json object data
 * @param {Object} imgRef - Meta data about the image to be run
 * @param {boolean} skipError - True the throwing an error should be skipped
 *
 * @returns {Object} - Joined imgRef and exists object
 */
const handelContainerExists = (container, exists, imgRef, skipExists) => {
  return skipExists
    ? { imgRef, containerRef: exists }
    : throwDupContainerName(container)
}

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

  return false
}

/**
 * Run a docker image command
 * @param {Object} args - arguments passed from the runTask method
 * @param {string} args.command - Initial command being run
 * @param {Array} args.options - arguments passed from the command line
 * @param {Object} args.tasks - All registered tasks of the CLI
 * @param {Object} globalConfig - Global config object for the keg-cli
 *
 * @returns {void}
 */
const runDockerImage = async args => {
  const { globalConfig, params, task, __internal={} } = args
  const {
    context,
    connect,
    command,
    cleanup=true,
    entrypoint,
    log,
    network,
    name,
    ports,
    pull,
    options=[],
    volumes=[]
  } = params

  // TODO: investigate add imageSelect to root docker image run
  // Need to add check if task called internally
  // imageSelect

  /*
  * ----------- Step 1 ----------- *
  * Get the Image name context and inspect meta data
  */
  const imgNameContext = await getImgNameContext(params)
  const { imgRef, refFrom } = await getImageRef(imgNameContext)
  const inspectContext = await getImgInspectContext(refFrom)

    /*
  * ----------- Step 2 ----------- *
  * Pull the image from the provider and tag it
  */
  pull && await docker.pull({ url: imgNameContext.full })

  /*
  * ----------- Step 3 ----------- *
  * Build the container meta data from the image's meta data
  */
  const containerName = name || `${IMAGE}-${imgNameContext.image}-${imgNameContext.tag}`
  const contextEnvs = await buildContextEnvs({
    params,
    globalConfig,
    // Merge the defualt envs with the image inspect envs
    // This way we have default envs, but not tied to a keg specific project
    envs: {...KEG_ENVS, ...inspectContext.envs},
  })

  /*
  * ----------- Step 4 ----------- *
  * Check if the container already exists
  */
  let containerRef = await docker.container.get(containerName)
  if(containerRef)
    return handelContainerExists(
      containerName,
      containerRef,
      imgRef,
      __internal.skipExists
    )

  /*
  * ----------- Step 5 ----------- *
  * Get the options for the docker run command
  */
  connect ? options.push([ `-it` ]) : options.push([ `-d` ])


  // TODO: Clear out the docker-compose labels, so it does not think it controls this container
  // const opts = await removeLabels(imgNameContext.providerImage, 'com.docker.compose', options)

  /*
  * ----------- Step 6 ----------- *
  * Run the docker image
  */
  await docker.image.run({
    log,
    ports,
    opts: options,
    image: refFrom,
    remove: cleanup,
    envs: contextEnvs,
    name: containerName,
    tag: imgNameContext.tag,
    ...(command && { cmd: command }),
    ...(entrypoint && { entry: entrypoint }),
    network: network || contextEnvs.KEG_DOCKER_NETWORK || DOCKER.KEG_DOCKER_NETWORK,
  })

  // If connecting to the container,
  // just exit the process after the container has finished running
  if(connect) process.exit(0)

  // Need to wait a bit for the container to start,
  return new Promise((res, rej) => {
    setTimeout(async () => {
      // Retry to get the containerRef after the container has been started
      containerRef = !connect && await docker.container.get(containerName)

      // Resolve the container and image refs
      res({ imgRef, containerRef })
    }, 1000)
  })

}

module.exports = {
  run: {
    name: 'run',
    alias: [ 'rn', 'connect', 'con' ],
    action: runDockerImage,
    description: `Run a docker image as a container and auto-conntect to it`,
    example: 'keg docker image run <options>',
    options: mergeTaskOptions(`docker image run`, `run`, `run`, {})
  }
}
