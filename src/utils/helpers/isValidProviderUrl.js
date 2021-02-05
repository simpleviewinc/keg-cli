const { exists } = require('@keg-hub/jsutils')

/**
 * Validate the passed in provider url meets requirements
 * @param {string} providerUrl - Url of an image hosted by a provider
 *
 * @returns {Promise<Object> - Docker Image ref}
 */
const isValidProviderUrl = providerUrl => {
  // Check if it's being pushed to the default docker registry
  // If so, just return true
  return providerUrl.includes('docker.io/')
    ? true
    // Ensure it's a url with a slash
    : providerUrl.includes(`/`) &&
        // Ensure it includes the tag separator
        providerUrl.includes(`:`) &&
        // Ensure the tag exists
        Boolean(providerUrl.split(':')[1]) &&
        // Ensure undefined was not added to it as a string
        !providerUrl.includes(`undefined`)
}

module.exports = {
  isValidProviderUrl
}