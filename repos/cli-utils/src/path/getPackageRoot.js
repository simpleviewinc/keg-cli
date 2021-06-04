const { tryRequireSync } = require('@keg-hub/jsutils/src/node')
const path = require('path')

/**
 * @param {string} location 
 * @returns {string} - root package directory of a path located at `location`, or else null if none exists
 */
 const getPackageRoot = location => {
  // base case at root directory
  if (location === '/')
    return null

  // check if the current location is the app root
  const nextPath = path.resolve(location, 'package.json')
  if (tryRequireSync(nextPath))
    return location

  // otherwise recurse up
  const parentPath = path.resolve(location, '..')
  return getPackageRoot(parentPath)
}

module.exports = { getPackageRoot }