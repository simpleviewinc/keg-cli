const { exists } = require('@keg-hub/jsutils')

/**
 * Finds a sub value of an object from a keyPath with dot notation
 * Also handles string keys that includes dots
 * @type {function}
 * @param {Object} obj - Object to be searched
 * @param {string} keyPath - Path to search using dot notation
 * 
 * @returns {*} Found value at the keyPath or undefined
 */
const getWithStringKeys = (obj, keyPath) => {
  const keySplit = keyPath.split('.')
  let subItem = []

  return keySplit.reduce((found, name, idx) => {
    const isLast = Boolean(idx === keySplit.length -1)

    if(subItem.length){
      // If a subItem exists, then check that first
      const dotSub = found[subItem.concat([name]).join('.')]
      // If a dotSub is found, then reset the subItem array and return the found value
      if(exists(dotSub)){
        subItem = []
        return dotSub
      }

      // Check if it's the last item in the keys
      // Then return undefined because the key path does not exist
      if(isLast) return undefined

    }

    // Check if the value exists at the name
    // If it does or there are no move keys then return it
    const sub = found[name]
    if(exists(sub) || isLast) return sub

    // If it does not exist, add it to the subItem array and return found
    subItem.push(name)

    return found
  }, obj)

}


module.exports = {
  getWithStringKeys
}