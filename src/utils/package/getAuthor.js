const { get } = require('@keg-hub/jsutils')
const { getGlobalConfig } = require('../globalConfig/getGlobalConfig')

/**
 * Gets the author to use for the docker commit command
 * @function
 * @param {Object} globalConfig - Kec CLI global config object
 * @param {string} author - Name of author passed from the command line
 *
 * @returns {*} - Response from the docker raw method
 */
const getAuthor = (globalConfig, author) => {
  globalConfig = globalConfig || getGlobalConfig()
  return author || get(globalConfig, 'docker.user', get(globalConfig, 'cli.git.user'))
}

module.exports = {
  getAuthor
}