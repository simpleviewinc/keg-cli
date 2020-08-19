const { get } = require('@ltipton/jsutils')
const { decrypt } = require('KegCrypto')
const { GLOBAL_CONFIG_PATHS } = require('KegConst/constants')

/**
 * Gets the public git key from the container envs
 * @param {Object} globalConfig - Global config object for the Keg CLI
 *
 * @returns {string} found public git key or empty string
 */
const getPublicGitKey = (globalConfig, password) => {
  return decrypt(get(globalConfig, `${GLOBAL_CONFIG_PATHS.GIT}.publicToken`, ''), password)
}

module.exports = {
  getPublicGitKey
}
