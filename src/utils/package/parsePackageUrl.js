const { generalError } = require('KegUtils/error/generalError')

/**
 * Parses a package url whose image is stored at the repo-level
 * @param {Array<string>} components - Package url split into individual parts
 *
 * @returns {Object} - Parse package url as key value pairs
 */
const parseRepoPackage = components => {
  const [ provider, account, repo, imageTag ] = components
  const [ image, tag ] = imageTag.split(':')
  return { account, image, provider, repo, tag }
}

/**
 * Parses a package url whose image is stored at the organization/account-level
 * @param {Array<string>} components - Package url split into individual parts
 *
 * @returns {Object} - Parse package url as key value pairs
 */
const parseOrgPackage = components => {
  const [ provider, account, imageTag ] = components
  const [ image, tag ] = imageTag.split(':')
  return { account, image, provider, tag, repo: image }
}


/**
 * Validates that the passed in url matches requirements for docker registry url
 * <br>Currently very simple, but could be updated to be more advanced at another time
 * <br>Throws is url is invalid
 * @param {string} url - Url to be validated
 * @param {Array<string>} components - Package url split into individual parts
 *
 * @return {void}
 */
const validateUrl = (url, components) => {
  ;(components.length < 3) && generalError(
    `Malformed package url. Your package url should conform to: <provider>/<account>/<image>:<tag> or <provider>/<account>/repo/<image>:<tag>
    - Example: ghcr.io/simpleviewinc/keg-core/keg-core:master or ghcr.io/simpleviewinc/keg-core:master
    - Your url: ${url}
    `
  )
}

/**
 * Parse a package url into named parts
 * @function
 * @example
 * parsePackageUrl('ghcr.io/lancetipton/keg-core/keg-core:1591977796609')
 * @param {string} url - Package URL to be parsed
 *
 * @returns {Object} - Parse package url as key value pairs
 */
const parsePackageUrl = (url='') => {
  const components = url.split('/')  

  validateUrl(url, components)

  return components.length === 3
    ? parseOrgPackage(components)
    : parseRepoPackage(components)
}

module.exports = {
  parsePackageUrl
}