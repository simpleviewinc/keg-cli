
/**
 * Gets the proxyDomain from the docker image ENVs based on passed in params
 * @function
 * @param {Object} params - Parameters passed to the task from the cmd line
 * @param {Object} contextData - Data derived from the current context and command
 *
 * @returns {string} - The found proxyDomain
 */
const domainFromImgEnv = async (imgNameContext) => {
  const { image, tag } = params
  const { id, rootId } = contextData
  
}

module.exports = {
  domainFromImgEnv
}