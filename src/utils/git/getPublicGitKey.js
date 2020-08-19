const { getContainerConst } = require('../docker/getContainerConst')

/**
 * Gets the public git key from the container envs
 * @param {string} cmdContext - the container context to get the public git key from
 *
 * @returns {string} found public git key or empty string
 */
const getPublicGitKey = cmdContext => {
  return getContainerConst(cmdContext, 'env.PUBLIC_GIT_KEY', '')
}

module.exports = {
  getPublicGitKey
}