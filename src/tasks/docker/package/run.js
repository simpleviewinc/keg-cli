const docker = require('KegDocCli')
const { Logger } = require('KegLog')
const { DOCKER } = require('KegConst/docker')
const { KEG_ENVS } = require('KegConst/envs')
const { logVirtualUrl } = require('KegUtils/log')
const { isUrl, get, isArr, pickKeys } = require('@keg-hub/jsutils')
const { proxyLabels } = require('KegConst/docker/labels')
const { generalError } = require('KegUtils/error/generalError')
const { buildLabel } = require('KegUtils/docker/getBuildLabels')
const { removeLabels } = require('KegUtils/docker/removeLabels')
const { parsePackageUrl } = require('KegUtils/package/parsePackageUrl')
const { buildContextEnvs } = require('KegUtils/builders/buildContextEnvs')
const { mergeTaskOptions } = require('KegUtils/task/options/mergeTaskOptions')
const { checkContainerExists } = require('KegUtils/docker/checkContainerExists')
const { getImgInspectContext } = require('KegUtils/getters/getImgInspectContext')

const { CONTAINER_PREFIXES, KEG_DOCKER_EXEC, KEG_EXEC_OPTS } = require('KegConst/constants')
const { PACKAGE } = CONTAINER_PREFIXES

/**
 * Search for the keg-proxy-port to use for registering with the keg-proxy
 * @function
 * @param {Array} proxyPort - Specific proxy port passed from the command line
 * @param {Array} ports - Ports passed from the command line
 * @param {Object} inspectContext - Docker image inspect meta data
 * @param {Object} KEG_PROXY_PORT - KEG_PROXY_PORT context env
 *
 * @returns {string} - Keg proxy port to use
 */
const getKegProxyPort = (ports, proxyPort, kegProxyPort, { labels, ports:imgPorts }) => {
  // If it's a defined env, just use it
  // Otherwise search for the keg port label
  return proxyPort ||
    kegProxyPort ||
    labels['com.keg.env.port'] ||
    get(imgPorts, '0') ||
    ports && ports.length && ports[0].split(':').pop()
}

/**
 * Loops the proxy labels and builds them in a format the docker run command needs
 * <br>Also gets the value for the proxy host so it can be logged
 * @function
 * @param {Array} optsWLabels - Options to pass to the docker run command
 * @param {Object} args - Contains values used to create the proxy labels
 * @param {string} args.proxyDomain - The subdomain for the proxy url
 * @param {string} args.contextEnvs - Environment variables of the image
 *
 * @returns {Object} - The options array with the proxy labels and the full proxy url
 */
const addProxyLabels = (optsWLabels, args) => {
  const builtOpts = [ ...optsWLabels ]
  let fullProxyUrl

  proxyLabels.map(labelData => {
    const [ key, valuePath, label ] = labelData
    const value = get(args.contextEnvs, key.toUpperCase(), get(args, valuePath))

    const builtLabel = value 
      ? buildLabel('', label, args, key, value)
      : !key && !valuePath && label
        ? `--label "${label}"`
        : undefined

    builtLabel && builtOpts.push(
      builtLabel
    )

    // Check if the key is for the proxy host, and get the url to be logged
    builtLabel && 
      key === 'KEG_PROXY_HOST' &&
      (fullProxyUrl = builtLabel.split('`')[1])

  })

  return { builtOpts, fullProxyUrl }
}

/**
 * Checks if the proxy host label already exists
 * <br>If it does not, it will try to build them based on the ENVs
 * <br>Logs out the proxy url for accessing the container in the browser
 * @function
 * @param {Array} optsWLabels - Options to pass to the docker run command
 * @param {Object} imgLabels - Labels already on the docker image
 * @param {Object} args - Contains values used to create the proxy labels
 * @param {string} args.proxyDomain - The subdomain for the proxy url
 * @param {string} args.contextEnvs - Environment variables of the image
 *
 * @returns {Array} - Built options array with the proxy labels added if needed
 */
const checkProxyUrl = (optsWLabels, imgLabels, args) => {
  // Get the proxy url from the label, so it can be printed to the terminal
  let proxyUrl = Object.entries(imgLabels)
    .reduce((proxyUrl, [ key, value ]) => {
      return value.indexOf(`Host(\``) === 0  ? value.split('`')[1] : proxyUrl
    }, false)

  // If no proxyUrl is set, then the proxy labels don't exist
  // So make call to try and add them to the image
  // Otherwise use the labels from the image, and don't add the proxy labels to the options array
  const { builtOpts, fullProxyUrl } = !proxyUrl
    ? addProxyLabels(optsWLabels, args)
    : { builtOpts: optsWLabels, fullProxyUrl: proxyUrl }

  // Log out the proxy url for easy access
  logVirtualUrl(fullProxyUrl)

  return builtOpts
}

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
const setupLabels = async (opts, inspectContext, contextEnvs, proxyDomain,) => {
  let optsWLabels = [ ...opts ]
  const imgInspect = inspectContext.inspectRef

  // If the image can't be found, just return
  if(!imgInspect) return optsWLabels

  // Clear out the docker-compose labels, so it does not think it controls this container
  optsWLabels = await removeLabels(imgInspect, 'com.docker.compose', optsWLabels)

  // Check if the proxy labels should be added based on the proxy url label
  return checkProxyUrl(optsWLabels, inspectContext.labels, {
    proxyDomain,
    contextEnvs,
  })

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
  const { globalConfig, options, params, task, tasks } = args
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
  const imageTaggedName = `${parsed.image}:${parsed.tag}`

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
    contextEnvs.KEG_PROXY_PORT,
    inspectContext
  )
  
  const optsWLabels = await setupLabels(
    [ `-it` ],
    inspectContext,
    // If we find a proxy port, then add it as an env with the others
    // This way the keg proxy label can be added to it
    (proxyPort ? { ...contextEnvs, KEG_PROXY_PORT: foundProxyPort } : contextEnvs),
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
