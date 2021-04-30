const { pullService } = require('./pullService')
const { proxyService } = require('./proxyService')
const { composeService } = require('./composeService')
const { getServiceArgs } = require('./getServiceArgs')
const { get, set, deepMerge } = require('@keg-hub/jsutils')
const { checkEnvConstantValue } = require('KegUtils/helpers/checkEnvConstantValue')

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
  const cmdContext = get(serviceArgs, 'params.tap', get(serviceArgs, 'params.context'))
  
  // Call the proxy service to make sure that is running
  await proxyService(serviceArgs)

  // Call the build service to ensure required images are built 
  const { imgNameContext, isNewImage } = await pullService(serviceArgs, 'compose')

  const internalOpts = { imgNameContext }

  // Check envs for running the docker exec command
  // If KEG_AUTO_DOCKER_EXEC is set to false then don't call docker exec
  // If it's true or not defined, then call docker exec
  checkEnvConstantValue(cmdContext, 'KEG_AUTO_DOCKER_EXEC', false)
    && (internalOpts.skipDockerExec = true)

  // Check envs for creating the mutagen auto-sync
  // If KEG_AUTO_SYNC is set to false then don't create a mutagen sync
  // If it's true or not defined, then create a mutagen sync
  checkEnvConstantValue(cmdContext, 'KEG_AUTO_SYNC', false)
    && (internalOpts.skipDockerSyncs = true)

  // Call the compose service to start the application
  // Pass in recreate, base on if a new image was pulled
  // Set 'pull' param to false, because we already did that above
  return await composeService(deepMerge(serviceArgs, {
    __internal: internalOpts,
    params: { pull: false, recreate: isNewImage },
  }))

}

module.exports = {
  startService
}
