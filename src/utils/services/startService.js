const { get, set, deepMerge } = require('@keg-hub/jsutils')
const { composeService } = require('./composeService')
const { pullService } = require('./pullService')
const { proxyService } = require('./proxyService')
const { getServiceArgs } = require('./getServiceArgs')

/**
 * Runs the build service, then the compose service
 * @function
 * @param {Object} args - Default task arguments passed from the runTask method
 * @param {Object} exArgs - Extra arguments to run the service
 * @param {string} exArgs.context - The context to run the `docker-compose` command in
 * @param {string} exArgs.container - Name of the container to run
 * @param {string} exArgs.image - Name of the image used to run the container
 * @param {string} exArgs.tap - Name of the tap to run the `docker-compose` command in
 *
 * @returns {*} - Response from the compose service
 */
const startService = async (args, exArgs) => {
  // Build the service arguments
  const serviceArgs = getServiceArgs(args, exArgs)

  // Call the proxy service to make sure that is running
  await proxyService(serviceArgs)

  // Call the build service to ensure required images are built 
  const { imgNameContext, isNewImage } = await pullService(serviceArgs)

  // Call the compose service to start the application
  // Pass in recreate, base on if a new image was pulled
  // Set 'pull' param to false, because we already did that above
  return await composeService(deepMerge(serviceArgs, {
    __internal: { imgNameContext },
    params: { pull: false, recreate: isNewImage },
  }))

}

module.exports = {
  startService
}
