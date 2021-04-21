const { get } = require('@keg-hub/jsutils')
const { getGlobalConfig } = require('../globalConfig/getGlobalConfig')

/**
 * Gets the author to use for the docker commit command
 * @function
 * @param {string} author - Name of author passed from the command line
 * @param {Object} globalConfig - Kec CLI global config object
 *
 * @returns {*} - Response from the docker raw method
 */
const getAuthor = (author, globalConfig) => {
  globalConfig = globalConfig || getGlobalConfig()
  return author || get(globalConfig, 'docker.user', get(globalConfig, 'cli.git.user'))
}

module.exports = {
  getAuthor
}