const docker = require('KegDocCli')

/**
 * Builds a production app bundle within a docker container
 * @function
 * @param {Object} args - arguments passed from the runTask method
 *
 * @returns {void}
 */
const buildAppBundle = async () => {

  /* Step 1: Connect to the image and build the bundle */
  // docker.container.exec('<container-id>', `yarn build:web`, 'tap/location/in/container')

  /* Step 2: Copy the new bundle to a new folder within the docker container */
  // docker.container.exec('<container-id>', `cp <path/to/bundle> <path/to/new/location>`)

  /* Step 3: Add bundle ran script */
  /* Would be better to add this at build time through the tap Dockerfile */
  /* Could also be added for internal apps directly in their Dockerfile */

  /* Step 4: Update the package run task, to accept a command to run the bundle run script */
  // This would override the default run script within the docker image //
  // Should only be used when not in a development env, or defined from a passed in option //

  return true
}


module.exports = {
  buildAppBundle
}