
const docker = require('KegDocCli')
const { get } = require('@keg-hub/jsutils')
const { CONTAINERS } = require('KegConst/docker/containers')
const { imageSelect } = require('KegUtils/docker/imageSelect')
const { removeLabels } = require('KegUtils/docker/removeLabels')
const { CONTAINER_PREFIXES } = require('KegConst/constants')
const { throwDupContainerName } = require('KegUtils/error/throwDupContainerName')
const { buildContainerContext } = require('KegUtils/builders/buildContainerContext')


const { getImgNameContext } = require('KegUtils/getters/getImgNameContext')

const { IMAGE } = CONTAINER_PREFIXES

const getImageContext = async (args, imgName) => {
  const { globalConfig, task, params } = args

  // Get a reference to the image
  const imgRef = await docker.image.get(imgName)

  // Get the context data for the command to be run
  const imgContext = await buildContainerContext({
    task,
    globalConfig,
    __internal: {},
    params: { ...params, context: imgName },
  })

  return { imgContext, imgRef }

}

/**
 * Called when the container to run already exists
 * Default is to throw an error, unless skipError is true
 * @param {string} container - Name of container that exists
 * @param {Object} exists - Container json object data
 * @param {Object} imgContext - Meta data about the image to be run
 * @param {boolean} skipError - True the throwing an error should be skipped
 *
 * @returns {Object} - Joined imgContext and exists object
 */
const handelContainerExists = (container, exists, imgContext, skipExists) => {
  return skipExists
    ? { ...imgContext, ...exists, }
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
  const { context, connect, cleanup, cmd, entry, log, network, options=[], volumes } = params

  const imgNameContext = await getImgNameContext(params)
  const { imgContext, imgRef } = await getImageContext(args, imgNameContext.image)

  // Build the name for the container
  const containerName = `${IMAGE}-${imgNameContext.image}-${imgNameContext.tag}`
  const { location, contextEnvs } = imgContext

  const exists = await docker.container.get(containerName)
  if(exists)
    return handelContainerExists(
      containerName,
      exists,
      imgContext,
      __internal.skipExists
    )

  connect
    ? options.push([ `-it` ])
    : options.push([ `-d` ])

  cleanup && options.push(`--rm`)
  entry && options.push(`--entrypoint ${ entry }`)

  // TODO: Clear out the docker-compose labels, so it does not think it controls this container
  // const opts = await removeLabels(imgNameContext.providerImage, 'com.docker.compose', options)

  await docker.image.run({
    log,
    opts: options,
    location,
    entry: cmd,
    envs: contextEnvs,
    name: containerName,
    tag: imgNameContext.tag,
    image: imgNameContext.providerImage,
  })

  const containerRef = connect ? false : await docker.container.get(containerName)
  return containerRef
    ? { imgContext, containerRef }
    : { imgContext }

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
      cmd: {
        alias: [ 'command', 'entry' ],
        description: 'Overwrite entry of the image. Use escaped quotes for spaces ( bin/bash )',
        example: 'keg docker image run --cmd \\"node index.js\\"',
        default: '/bin/bash'
      },
      entry: {
        alias: [ 'entrypoint', 'ent' ],
        description: 'Overwrite ENTRYPOINT of the image. Use escaped quotes for spaces ( bin/bash)',
        example: 'keg tap run --entry node'
      },
      log: {
        description: 'Log the docker run command to the terminal',
        example: 'keg docker image run --log',
        default: false,
      },
      network: {
        alias: [ 'net' ],
        description: 'Set the docker run --network option to this value',
        example: 'keg docker package run --network host'
      },
      tag: {
        description: 'Tag of the image to be run',
        example: 'keg docker image run --context core --tag updates',
      },
      volumes: {
        description: 'Mount the local volumes defined in the docker-compose config.yml.',
        example: 'keg docker package run --volumes false',
        default: true
      },
    },
  }
}
