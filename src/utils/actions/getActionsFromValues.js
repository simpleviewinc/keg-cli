const { loadValuesFiles } = require('KegConst/docker/loaders')
const { getSetting } = require('KegUtils/globalConfig/getSetting')

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
  return await loadValuesFiles({
    loadPath: 'actions',
    env: params.env || getSetting('defaultEnv'),
    __internal: {
      ...params.__internal,
      ...params.__injected,
    },
    container: params.containerRef || params.container,
  })
}

module.exports = {
  getActionsFromValues
}