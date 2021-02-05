const { Logger } = require('KegLog')
const { proxyService } = require('./proxyService')
const { get, deepMerge } = require('@keg-hub/jsutils')
const { getServiceArgs } = require('./getServiceArgs')
const { composeService } = require('./composeService')

/**
 * Runs the build service, then the compose service
 * @function
 * @param {Object} args - Default task arguments passed from the runTask method
 * @param {Object} argsEXT - Extra arguments to run the service
 * @param {string} argsEXT.context - The context to run the `docker-compose` command in
 * @param {string} argsEXT.container - Name of the container to run
 * @param {string} argsEXT.image - Name of the image used to run the container
 * @param {string} argsEXT.tap - Name of the tap to run the `docker-compose` command in
 *
 * @returns {*} - Response from the compose service
 */
const restartService = async (args, exArgs) => {
  // Build the service arguments
  const serviceArgs = getServiceArgs(args, exArgs)

  // Call the proxy service to make sure that is running
  await proxyService(serviceArgs)

  // Call the compose service to restart the application
  // Set 'pull' param to false, because we are restarting containers
  return await composeService(deepMerge(serviceArgs, {
    params: { pull: false, recreate: true },
  }))

}

module.exports = {
  restartService
}
