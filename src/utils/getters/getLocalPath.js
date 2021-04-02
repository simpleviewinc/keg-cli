const { get } = require('@keg-hub/jsutils')
const { DOCKER } = require('KegConst/docker')
const { getGitPath } = require('../git/getGitPath')
const { getContainerConst } = require('KegUtils/docker/getContainerConst')

/**
 * Gets the local path the sync will use
 * @param {Object} args.globalConfig - Global config object for the keg-cli
 * @param {string} context - Context or name of the container to get the remote path from
 * @param {string} local - Local path where the sync will be created
 * @param {string} dependency - Name contained in an ENV that defines the path in docker
 *
 * @returns {string}
 */
const getLocalPath = (globalConfig, context, dependency, local) => {
  return local || getContainerConst(
    context,
    `${ dependency.toUpperCase() }_PATH`,
    getGitPath(globalConfig, dependency)
  )
}


module.exports = {
  getLocalPath
}