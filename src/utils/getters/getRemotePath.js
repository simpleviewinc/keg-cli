const { get } = require('@keg-hub/jsutils')
const { DOCKER } = require('KegConst/docker')
const { getContainerConst } = require('KegUtils/docker/getContainerConst')

/**
 * Gets the path in the docker container the sync will use
 * @param {string} context - Context or name of the container to get the remote path from
 * @param {string} dependency - Name contained in an ENV that defines the path in docker
 * @param {string} remote - Path in the docker container where the sync will be created
 *
 * @returns {string}
 */
const getRemotePath = (context, dependency, remote) => {
  return remote || getContainerConst(
    context,
    `DOC_${ dependency.toUpperCase() }_PATH`
  )
}

module.exports = {
  getRemotePath
}