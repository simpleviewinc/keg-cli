const { get, noOpObj } = require('@keg-hub/jsutils')
const { domainFromBranch } = require('./domainFromBranch')
const { domainFromImgEnv } = require('./domainFromImgEnv')
const { getImgNameContext } = require('KegUtils/getters/getImgNameContext')

/**
 * Gets the proxyDomain from the local git branch of the passed in context
 * @function
 * @param {Object} params - Parameters passed to the task from the cmd line
 * @param {Object} contextEnvs - Built environment variables for the service
 *
 * @returns {string} - The found proxyDomain
 */
const getDomainBranch = (args) => {
  const { params=noOpObj, contextEnvs=noOpObj } = args
  
  const contextName = get(params, `__injected.tap`) ||
    get(params, `tap`) ||
    get(params, `__injected.context`) ||
    get(params, `context`)

  return domainFromBranch(
    contextName,
    get(contextEnvs, `KEG_CONTEXT_PATH`)
  )
}

/**
 * Gets the proxyDomain from a docker label, or git branch based on passed in params
 * @function
 * @param {Object} args - Parameters passed to the task from the cmd line
 * @param {Object} imgNameContext - Image name context object
 *
 * @returns {string} - The found proxyDomain
 */
const getKegProxyDomain = (args, imgNameContext) => {
  imgNameContext = imgNameContext || getImgNameContext(args.params)

  // TODO [TAP-PROXY] - Figureout based on getting docker image || docker container
  // If it has a rootId then we are getting the proxyDomain for a docker image
  // Of a docker image will have a rootId
  return fromImg ? domainFromImgEnv(args) : getDomainBranch(args)
}

module.exports = {
  getKegProxyDomain
}