const { get } = require('@keg-hub/jsutils')
const { DOCKER } = require('KegConst/docker')
const { getKegProxyDomain } = require('KegUtils/proxy/getKegProxyDomain')
const { getImgNameContext } = require('KegUtils/getters/getImgNameContext')

/**
 * Builds context args needed to create the injected docker-compose file
 * @function
 * @param {Object} args - Data to fill the compose template with (Sames args passed to a task)
 * @param {Object} imgNameContext - Data to fill the compose template with
 
 *
 * @returns {Object} - Build compose context data
 */
const getComposeContextData = async (args, imgNameContext) => {

  const composeContext = {}

  // Get the pull image url for the service form the imageNameContext
  // If KEG_IMAGE_FROM ENV is defined, then use the env
  // Otherwise used the imageNameContext.full image url
  // This allows the ENV to be dynamic if it's defined,
  // Or use the image url when it's not
  composeContext.imageFrom = get(args, 'contextEnvs.KEG_IMAGE_FROM')
    ? '${KEG_IMAGE_FROM}'
    : imgNameContext.full

  // TODO: Investigate loading the default compose config,
  // Use this helper => getServiceName
  // This will always ensure it matches

  // The the docker image name for the service being started
  composeContext.service = get(
    args, `contextEnvs.KEG_COMPOSE_SERVICE`,
    get(args, `params.__injected.image`,
      get(args, `contextEnvs.IMAGE`,
        get(args, `contextEnvs.CONTAINER_NAME`, imgNameContext.image)
      )
    )
  )

  // Get the root path where the docker container should be built from
  composeContext.buildContextPath = get(
    args, `params.__injected.injectPath`,
    get(args, `contextEnvs.KEG_CONTEXT_PATH`, '${KEG_CONTEXT_PATH}')
  )

  // Get the path to the Dockerfile
  composeContext.dockerPath = get(
    args, `params.__injected.dockerPath`,
    get(args, `contextEnvs.KEG_DOCKER_FILE`, '${KEG_DOCKER_FILE}')
  )

  // Get the shared docker network
  composeContext.dockerNetwork = get(
    args, `contextEnvs.KEG_DOCKER_NETWORK`,
    get(DOCKER, `KEG_DOCKER_NETWORK`, '${KEG_DOCKER_NETWORK}')
  )

  // The the docker container name for the service being started
  composeContext.container = get(
    args, `params.__injected.container`,
    get(args, `params.container`,
      get(args, `contextEnvs.CONTAINER_NAME`, composeContext.service)
    )
  )

  composeContext.proxyDomain = await getKegProxyDomain(args, imgNameContext)

  return composeContext
}

module.exports = {
  getComposeContextData
}