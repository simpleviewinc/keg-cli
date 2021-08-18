const docker = require('KegDocCli')
const { kegLabelKeys } = require('KegConst/docker/labels')
const { throwContainerNotFound } = require('KegUtils/error')


/**
 * Gets a container object from the passed in args
 * If multiple 
 * @function
 * @param {string} context - The current tap/app context of the task
 * @param {string} selector - Name or ID of the container to find
 * @param {string} prefix - Prefix in the containers name ( img | package )
 * @param {string} name - Full or partial of the containers name 
 *
 * @returns {Object} - Found container or null
 */
const findContainer = async (context, selector, prefix, name='') => {
  const containers = await docker.container.list()
  !containers.length && throwContainerNotFound(selector)

  const possible = []
  let exactMatch

  containers.map(cont => {
    if(exactMatch) return

    const match = [ 'id', 'name', 'image' ].find(prop => cont[prop] === selector)

    // If there's an exact match then use that
    if(match && !prefix && !name) return (exactMatch = cont)

    // Get the context from the image name
    const imgContext = (cont.image.split('/').pop().split(':')[0] || '').trim()
    const imgMatch = imgContext !== selector && imgContext !== context 
  
    // Get the context from the label added by the keg-cli
    const labelContext = (cont.labelsObj[kegLabelKeys.KEG_ENV_CONTEXT] || '').trim()
    const labelMatch = labelContext !== selector && labelContext !== context

    // If not context match, then just return
    if(!imgContext && !labelContext) return null

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

  return exactMatch || (possible.length === 1 && possible.shift())
}

module.exports = {
  findContainer
}
