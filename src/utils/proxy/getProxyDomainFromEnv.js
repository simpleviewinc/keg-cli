
/**
 * Gets the proxyDomain from the docker image ENVs based on passed in params
 * @function
 * @param {Object} params - Parameters passed to the task from the cmd line
 * @param {Object} contextData - Data derived from the current context and command
 *
 * @returns {string} - The found proxyDomain
 */
const getProxyDomainFromEnv = async (params, contextData) => {
  const { image, tag } = params
  const { id, rootId } = contextData
  // const fromLabel = Boolean((image && tag) || id)
  // const labelRef = fromLabel && (id || (tag && image ? `${image}:${tag}` : image))
  // TODO: [TAP-PROXY] - Update to pull an ENV with proxy domain value
  // abelRef, rootId ? 'image' : 'container'
}

module.exports = {
  getProxyDomainFromEnv
}