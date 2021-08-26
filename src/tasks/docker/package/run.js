const docker = require('KegDocCli')
const { Logger } = require('KegLog')
const { DOCKER } = require('KegConst/docker')
const { KEG_ENVS } = require('KegConst/envs')
const { logVirtualUrl } = require('KegUtils/log')
const { isUrl, get, pickKeys } = require('@keg-hub/jsutils')
const { generalError } = require('KegUtils/error/generalError')
const { removeLabels } = require('KegUtils/docker/removeLabels')
const { parsePackageUrl } = require('KegUtils/package/parsePackageUrl')
const { buildContextEnvs } = require('KegUtils/builders/buildContextEnvs')
const { mergeTaskOptions } = require('KegUtils/task/options/mergeTaskOptions')
const { checkContainerExists } = require('KegUtils/docker/checkContainerExists')
const { getImgInspectContext } = require('KegUtils/getters/getImgInspectContext')

const { CONTAINER_PREFIXES, KEG_DOCKER_EXEC, KEG_EXEC_OPTS } = require('KegConst/constants')
const { PACKAGE } = CONTAINER_PREFIXES


// TODO: {TAP-PROXY} Update to pull setting for tap proxy from global config
// Remove labels from proxy port code
// 
/**
 * Search for the tap-proxy-port to use for registering with the tap-proxy
 * @function
 * @param {Array} proxyPort - Specific proxy port passed from the command line
 * @param {Array} ports - Ports passed from the command line
 * @param {Object} inspectContext - Docker image inspect meta data
 * @param {Object} TAP_PROXY_PORT - TAP_PROXY_PORT context env
 *
 * @returns {string} - Keg proxy port to use
 */
const getKegProxyPort = (ports, proxyPort, kegProxyPort, { ports:imgPorts }) => {
  // If it's a defined env, just use it
  // Otherwise search for the keg port label
  return proxyPort ||
    kegProxyPort ||
    get(imgPorts, '0') ||
    ports && ports.length && ports[0].split(':').pop()
}


// TODO: {TAP-PROXY} Find a way to get the subdomain for an image / package / not installed locally 
/**
 * Builds a docker container so it can be run
 * @function
 * @param {Array} opts - Options to pass to the docker run command
 * @param {Object} inspectContext - Context object of containing image inspect content
 * @param {Object} proxyDomain - Domain for the proxy built form the parsed docker package url
 * @param {Object} contextEnvs - ENVs for the current image context
 *
 * @returns {Array} - Opts array with the labels to be overwritten
 */
const setupLabels = async (opts, inspectContext, contextEnvs, proxyDomain) => {
  let optsWLabels = [ ...opts ]
  const imgInspect = inspectContext.inspectRef

  // If the image can't be found, just return
  if(!imgInspect) return optsWLabels

  // Clear out the docker-compose labels, so it does not think it controls this container
  optsWLabels = await removeLabels(imgInspect, 'com.docker.compose', optsWLabels)

  // TODO: {TAP-PROXY} Find a way to get the subdomain for an image / package / not installed locally like from inpect.Config.Env
  // Check if the proxy labels should be added based on the proxy url label
  const subdomain = get(imgInspect, 'Config.Env.KEG_PROXY_DOMAIN')
  // Log out the proxy url for easy access
  logVirtualUrl(`${subdomain}.${KEG_ENVS.KEG_PROXY_HOST}`)

  return optsWLabels
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
const dockerPackageRun = async args => {
  const { globalConfig, params } = args
  const {
    command,
    context,
    cleanup=true,
    entrypoint,
    log,
    network,
    name,
    package,
    proxyPort,
    ports,
    pull,
    namespace=get(globalConfig, `docker.namespace`),
    provider=get(globalConfig, `docker.providerUrl`),
  } = params

  /*
  * ----------- Step 1 ----------- *
  * Get the full package url
  */
  const providerAccount = `${provider}/${namespace}`

  const packageUrl = isUrl(package)
    ? package
    : !package.includes('/') && isUrl(providerAccount)
      ? `${providerAccount}/${package}`
      : generalError(`Invalid package url. Expected a url but received`, package)

  const parsed = parsePackageUrl(packageUrl)
  const containerName = name || `${ PACKAGE }-${ parsed.image }-${ parsed.tag }`

  /*
  * ----------- Step 2 ----------- *
  * Pull the image from the provider and tag it
  */
  pull && await docker.pull({ url: packageUrl })

  /*
  * ----------- Step 3 ----------- *
  * Build the container context information
  */
  const inspectContext = await getImgInspectContext({ image: packageUrl })

  const contextEnvs = await buildContextEnvs({
    params,
    globalConfig,
    // Merge the defualt envs with the image inspect envs
    // This way we have default envs, but not tied to a keg specific project
    envs: {...KEG_ENVS, ...inspectContext.envs},
  })

  /*
  * ----------- Step 3.1 ----------- *
  * Check if the container already exists, and if it should be removed!
  */
  const containerExists = await checkContainerExists({
    args,
    context: parsed.image,
    id: inspectContext.id,
    containerRef: containerName,
  })

  if(containerExists)
    return Logger.highlight(`Exiting task because container`, `"${containerExists}"`, `is still running!\n`)

  /*
  * ----------- Step 4 ----------- *
  * Get the options for the docker run command
  * Get the metadata and labels from the image
  */
  const foundProxyPort = getKegProxyPort(
    ports,
    proxyPort,
    contextEnvs.TAP_PROXY_PORT,
    inspectContext
  )
  
  const optsWLabels = await setupLabels(
    [ `-it` ],
    inspectContext,
    // If we find a proxy port, then add it as an env with the others
    // This way the keg proxy label can be added to it
    (
      proxyPort
        ? {
              TAP_PROXY_PORT: foundProxyPort,
              KEG_PROXY_PORT: foundProxyPort,
              ...contextEnvs 
            }
        : contextEnvs
    ),
    `${parsed.image}-${parsed.tag}`,
  )

  /*
  * ----------- Step 5 ----------- *
  * Run the docker image as a container
  */
  // Get the keg exec cmd, and override the default if command param is passed
  const kegExecCmd = command || contextEnvs.KEG_EXEC_CMD

  try {
    await docker.image.run({
      log,
      ports,
      remove: cleanup,
      opts: optsWLabels,
      image: packageUrl,
      name: containerName,
      ...(command && { cmd: command }),
      ...(entrypoint && { entry: entrypoint }),
      envs: {
        ...contextEnvs,
        [KEG_DOCKER_EXEC]: KEG_EXEC_OPTS.packageRun,
        ...(kegExecCmd && { KEG_EXEC_CMD: kegExecCmd })
      },
      network: network || contextEnvs.KEG_DOCKER_NETWORK || DOCKER.KEG_DOCKER_NETWORK,
    })
  }
  catch(err){
    Logger.error(err.stack)
    process.exit(1)
  }

}

module.exports = {
  run: {
    name: 'run',
    action: dockerPackageRun,
    description: `Runs a git pr docker image in a container`,
    example: 'keg docker package run <options>',
    options: pickKeys(
      mergeTaskOptions(`docker package`, 'run', 'run', {
        package: {
          description: 'Pull request package url or name',
          example: `keg docker package --package lancetipton/keg-core/keg-core:bug-fixes`,
          required: true,
          ask: {
            message: 'Enter the docker package url or path (<user>/<repo>/<package>:<tag>)',
          }
        },
        command: {
          default: undefined
        },
        name: {
          description: 'Set the name of the docker container being run',
          example: 'keg docker package run --name my-container',
        },
        pull: {
          alias: [ 'pl' ],
          description: `Pull the most recent image before building.`,
          example: `keg docker package run --no-pull`,
          default: true
        }
      }),
      [
        'package',
        'command',
        'entrypoint',
        'cleanup',
        'log',
        'name',
        'namespace',
        'network',
        'provider',
        'proxyPort',
        'ports',
        'pull'
      ]
    )
  }
}
