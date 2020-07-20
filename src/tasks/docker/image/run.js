
const docker = require('KegDocCli')
const { spawnCmd } = require('KegProc')
const { get } = require('@ltipton/jsutils')
const { CONTAINERS } = require('KegConst/docker/containers')
const { imageSelect } = require('KegUtils/docker/imageSelect')
const { getContainerConst } = require('KegUtils/docker/getContainerConst')
const { HTTP_PORT_ENV, CONTAINER_PREFIXES } = require('KegConst/constants')
const { getServicePorts } = require('KegUtils/docker/compose/getServicePorts')
const { throwDupContainerName } = require('KegUtils/error/throwDupContainerName')
const { getServiceVolumes } = require('KegUtils/docker/compose/getServiceVolumes')
const { loadComposeConfig } = require('KegUtils/docker/compose/loadComposeConfig')
const { buildContainerContext } = require('KegUtils/builders/buildContainerContext')
const { IMAGE } = CONTAINER_PREFIXES

const buildContainerName = async cmdContext => {

  const imgName = get(
    CONTAINERS,
    `${ cmdContext.toUpperCase() }.ENV.IMAGE`,
    cmdContext
  )

  const imgContainer = `${ IMAGE }-${ imgName }`
  const exists = await docker.container.exists(
    imgContainer,
    container => container.name === imgContainer,
    'json'
  )

  return imgContainer
}

const getImageContext = async (args) => {
  const { globalConfig, params, task } = args
  const { tag } = params

  // Get the context data for the command to be run
  const containerContext = await buildContainerContext({
    globalConfig,
    task,
    params,
  })

  // Build the name for the container
  const container = await buildContainerName(containerContext.cmdContext)

  return { ...containerContext, container, tag }
}

const getImageData = async args => {
  const { globalConfig, task, params } = args

  const image = params.image &&
    await docker.image.get(params.image) ||
    await imageSelect(args)

  // Get the context data for the command to be run
  const containerContext = await buildContainerContext({
    task,
    globalConfig,
    params: { ...params, context: image.rootId },
  })

  // Build the name for the container
  const container = await buildContainerName(containerContext.cmdContext)

  return {
    ...containerContext,
    container,
    tag: image.tag,
    image: image.rootId,
  }

}

/**
 * Maps the defined ports in the ENVS to -p docker argument
 * <br/>This allows those ports to be exposed outside the container
 * @param {Object} envs - Defined environment variables for the container
 *
 * @returns {Array} - ENV ports in docker argument format
 */
const addExposedPorts = async (contextEnvs, composeConfig) => {
  const servicePorts = await getServicePorts(contextEnvs, composeConfig) || []
  
  return Object.keys(contextEnvs).reduce((ports, key) => {
    const addPort = key.includes('_PORT')
      ? key === HTTP_PORT_ENV
        ? `-p 80:${contextEnvs[key]}`
        : `-p ${contextEnvs[key]}:${contextEnvs[key]}`
      : null

    return addPort && ports.indexOf(addPort) === -1
      ? ports.concat([ addPort ])
      : ports
  }, servicePorts)
}

/**
 * Gets values form the docker-compose.yml config based on service name
 * @param {Object} contextEnvs - Defined environment variables for the container
 * @param {Array} opts - Already added docker command arguments 
 *
 * @returns {Array} - opts array updated with docker-compose service values
 */
const getServiceValues = async (contextEnvs, opts) => {

  const composePath = get(contextEnvs, `KEG_COMPOSE_DEFAULT`)
  if(!composePath) return opts
  
  const composeConfig = await loadComposeConfig({ composePath })

  const ports = await addExposedPorts(contextEnvs, composeConfig)
  opts = opts.concat(ports)

  const volumes = await getServiceVolumes(contextEnvs, composeConfig)
  opts = opts.concat(volumes)

  return opts

}

/**
 * Called when the container to run already exists
 * Default is to throw an error, unless skipError is true
 * @param {string} container - Name of container that exists
 * @param {Object} exists - Container json object data
 * @param {Object} imageContext - Meta data about the image to be run
 * @param {boolean} skipError - True the throwing an error should be skipped
 *
 * @returns {Object} - Joined imageContext and exists object
 */
const handelContainerExists = (container, exists, imageContext, skipExists) => {
  return skipExists
    ? { ...imageContext, ...exists, }
    : throwDupContainerName(container)
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
  const { context, connect, cleanup, entry, log, options } = params

  const imageContext = context
    ? await getImageContext(args)
    : await getImageData(args)

  const { tag, location, contextEnvs, container, image } = imageContext

  const exists = await docker.container.get(container)

  if(exists)
    return handelContainerExists(
      container,
      exists,
      imageContext,
      __internal.skipExists
    )


  let opts = connect
    ? options.concat([ `-it` ])
    : options.concat([ `-d` ])

  cleanup && opts.push(`--rm`)

  opts = await getServiceValues(contextEnvs, opts)


  await docker.image.run({
    tag,
    log,
    opts,
    entry,
    image,
    location,
    envs: contextEnvs,
    name: container,
  })

  const runningContainer = await docker.container.get(container)
  return runningContainer
    ? { ...imageContext, ...runningContainer }
    : imageContext

}

module.exports = {
  run: {
    name: 'run',
    alias: [ 'rn', 'connect', 'con' ],
    action: runDockerImage,
    description: `Run a docker image as a container and auto-conntect to it`,
    example: 'keg docker image run <options>',
    options: {
      context: {
        alias: [ 'name' ],
        description: 'Name of the image to run',
        example: 'keg docker image run --context core'
      },
      cleanup: {
        alias: [ 'clean', 'rm' ],
        description: 'Auto remove the docker container after exiting',
        example: `keg docker image run  --cleanup false`,
        default: true
      },
      connect: {
        alias: [ 'conn', 'con', 'it' ],
        description: 'Auto connects to the docker containers stdio',
        example: 'keg docker image run --connect false',
        default: true
      },
      image: {
        description: 'Image id of the image to run',
        example: 'keg docker image run --image <id>'
      },
      options: {
        alias: [ 'opts' ],
        description: 'Extra docker run command options',
        example: `keg docker image run --options \\"-p 80:19006 -e MY_ENV=data\\"`,
        default: []
      },
      entry: {
        description: 'Overwrite entry of the image. Use escaped quotes for spaces ( bin/bash )',
        example: 'keg docker image run --entry \\"node index.js\\"',
        default: '/bin/bash'
      },
      log: {
        description: 'Log the docker run command to the terminal',
        example: 'keg docker image run --log',
        default: false,
      },
      tag: {
        description: 'Tag of the image to be run',
        example: 'keg docker image run --context core --tag updates',
      }
    },
  }
}
