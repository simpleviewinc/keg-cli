const docker = require('KegDocCli')
const { loadValuesFiles } = require('KegConst/docker/loaders')
const { generalError } = require('KegUtils/error/generalError')
const { getSetting } = require('KegUtils/globalConfig/getSetting')
const { getKegContext } = require('KegUtils/getters/getKegContext')

/**
 * Gets the action object from the loaded values files of a container
 * @function
 * @param {Object} params
 * @param {Object} params.env - The current env of the task being run
 * @param {Object} params.__internal - Any extra / injected params for injected taps
 * @param {Object} params.containerRef - Reference to the container of the actions to load
 *
 * @returns {Object} - Found actions from the values files of the container 
 */
const getActionsFromValues = async params => {
  let containerName = params.cmdContext ||
    params.context ||
    params.containerRef ||
    params.container

  containerName = !docker.isDockerId(containerName)
    ? containerName
    : await (async () => {
        const container = await docker.container.get(containerName)
        return container && container.name
      })()

  return !containerName
    ? generalError(`Could not find container name from params`, params)
    : await loadValuesFiles({
        loadPath: 'actions',
        env: params.env || getSetting('defaultEnv'),
        __internal: {
          ...params.__internal,
          ...params.__injected,
        },
        container: getKegContext(containerName),
      })
}

module.exports = {
  getActionsFromValues
}