const docker = require('KegDocCli')
const { getTapObj } = require('KegUtils/globalConfig/getTapObj')
const { startTapProxy } = require('KegUtils/proxy/startTapProxy')
const { runInternalTask } = require('KegUtils/task/runInternalTask')
const { checkContainerPaths } = require('KegUtils/services/injectService')
const { getContainerConst } = require('KegUtils/docker/getContainerConst')
const { checkEnvConstantValue } = require('KegUtils/helpers/checkEnvConstantValue')
/**
 * Checks if the proxy container exists, and if not, starts it
 * @function
 * @param {Object} args - Default task arguments passed from the runTask method
 *
 * @returns {boolean} - True if the proxy container already exists
 */
const proxyService = async args => {
  const { params } = args
  const { tap, context } = params

  // Check if the container need the tap-proxy started
  // If KEG_USE_PROXY is set to false then don't start the proxy
  // If it's true or not defined, then start the proxy
  const startProxy = !checkEnvConstantValue(tap || context, 'KEG_USE_PROXY', false)
  if(startProxy === false) return false

  const tapObj = await getTapObj(args)
  const { serviceName } = await checkContainerPaths(tapObj.name, tapObj.path)

  // Make call to check if the tap-proxy container exists
  const proxyContainer = await docker.container.get(
    serviceName,
    container => (container.name === serviceName),
    'json'
  )

  const proxyNotRunning = Boolean(!proxyContainer || proxyContainer.state !== 'running')

  // If the proxy container does not exist or it's not running, then start it
  // This will ensure we can route traffic to all other containers
  proxyNotRunning && await startTapProxy(args, tapObj)

  return true
}

module.exports = {
  proxyService
}