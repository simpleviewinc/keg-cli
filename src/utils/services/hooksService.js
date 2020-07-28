const { Logger } = require('KegLog')
const { get, checkCall } = require('@ltipton/jsutils')
const { getServiceArgs } = require('./getServiceArgs')
const { getRepoPath } = require('../getters/getRepoPath')
const { runInternalTask } = require('../task/runInternalTask')
const { checkPathExists } = require('../helpers/checkPathExists')
const { requireFile } = require('KegFileSys')

/**
 * Ensures `/container` is not added to the hook path more then once
 * @function
 * @param {string} contextPath - Path to the current context of the keg-cli task
 *
 * @returns {string} - Path to the hooks folder with `/container/hooks` added as needed
 */
const ensureContainer = contextPath => {
  return !contextPath
    ? contextPath
    : contextPath.split('/').pop() === 'container'
      ? `${ contextPath }/hooks`
      : `${ contextPath }/container/hooks`
}

/**
 * Gets the path to the hooks folder for the current context or location
 * @function
 * @param {string} context - Current context of the keg-cli task
 * @param {string} location - Path to the current context
 *
 * @returns {string} - Path to the hooks folder
 */
const getHooksPath = async (context, location) => {
  const contextPath = ensureContainer(location || getRepoPath(context))
  
  return contextPath && await checkPathExists(contextPath)
    ? contextPath
    : false
}

/**
 * Builds the path to a hooks file based on the passed in context || location and hook name
 * @function
 * @param {string} context - Current context of the keg-cli task
 * @param {string} location - Path to the current context
 * @param {string} hook - Name of the hook to load
 *
 * @returns {string} - Path to the hook
 */
const getHookFile = async (context, location, hook) => {
  const hooksPath = await getHooksPath(context, location)
  
  const hookPath = hooksPath && `${ hooksPath }/${ hook }.js`
  return hookPath && await checkPathExists(hookPath)
    ? hookPath
    : false
}

/**
 * Loads a hook and calls it for the container/hooks folder for the current context
 * @function
 * @param {Object} args - Default task arguments passed from the runTask method
 * @param {Object} exArgs - Extra arguments to run the service
 *
 * @returns {*} - Response from the loaded hook
 */
const hooksService = async (args, exArgs={}) => {
  const serviceArgs = await getServiceArgs(args, exArgs)
  const { context, hook, location } = serviceArgs.params

  if(!hook || (!context && !location)) return

  const hookPath = await getHookFile(context, location, hook)
  if(!hookPath) return
  
  const { data } = requireFile(hookPath)

  return checkCall(data, serviceArgs)

}

module.exports = {
  hooksService
}