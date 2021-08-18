const docker = require('KegDocCli')
const { Logger } = require('KegLog')
const { checkCall } = require('@keg-hub/jsutils')
const { kegLabelKeys } = require('KegConst/docker/labels')
const { throwContainerNotFound } = require('KegUtils/error')
const { containerSelect } = require('KegUtils/docker/containerSelect')

/**
 * Checks if the container matches the passed in context or selector
 * @function
 * @param {Object} cont - Container object to check
 * @param {string} context - The current tap/app context of the task
 * @param {string} selector - Name or ID of the container to find
 *
 * @returns {Boolean} - True if a matching context is found
 */
const hasContextMatch = (cont, context, selector) => {
  // Get the context from the image name
  const imgContext = (cont.image.split('/').pop().split(':')[0] || '').trim()
  const imgMatch = imgContext !== selector && imgContext !== context 

  // Get the context from the label added by the keg-cli
  const labelContext = (cont.labelsObj[kegLabelKeys.KEG_ENV_CONTEXT] || '').trim()
  const labelMatch = labelContext !== selector && labelContext !== context

  return imgContext || labelContext
}

/**
 * Returns a matching container from all possible matches
 * @function
 * @param {Object} exactMatch - Found matching container object
 * @param {Array} possible - Group of possible matching containers
 *
 * @returns {Object} - Found container or null
 */
const pickContainer = (exactMatch, possible) => {
  return exactMatch
    ? exactMatch
    : possible.length === 1
      ? possible.shift()
      : checkCall(async () => {
          Logger.warn(`\nFound multiple matching containers. Please select one`)
          return await containerSelect(null, null, possible)
        })
}
 
/**
 * Gets a container object from the passed in args
 * If multiple are found, it asks the user to select one
 * @function
 * @param {string} context - The current tap/app context of the task
 * @param {string} selector - Name or ID of the container to find
 * @param {string} prefix - Prefix in the containers name ( img | package )
 * @param {string} name - Full or partial of the containers name 
 *
 * @returns {Object} - Found container or null
 */
const findContainer = async ({ context, selector, prefix, name='', tag }) => {
  const containers = await docker.container.list()
  !containers.length && throwContainerNotFound(selector)

  const possible = []
  let exactMatch

  containers.map(cont => {
    if(exactMatch) return

    const match = [ 'id', 'name' ].find(prop => cont[prop] === selector)
    // If there's an exact match then use that
    if(match && !prefix && !name && !tag) return (exactMatch = cont)

    // If not context match, then just return
    if(!hasContextMatch(cont, context, selector)) return null

    // Check if we have a tag match from the image name
    if(tag && tag !== cont.image.split(':').pop()) return

    // If a context matches, then check for a prefix match
    const prefixMatch = prefix && cont.name.indexOf(prefix) === 0
    // If the prefix matches, add it as a possible option
    prefixMatch && possible.push(cont)

    // Check for a name match
    // If name, and prefix match, set the exact match
    // Otherwise, if no prefix match, but name match, set it as possible
    name && cont.name.includes(name)
      ? prefixMatch
        ? (exactMatch = cont)
        : possible.push(cont)
      : null
  })

  return pickContainer(exactMatch, possible)
}

module.exports = {
  findContainer
}
