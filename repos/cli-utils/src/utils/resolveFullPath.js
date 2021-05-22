const path = require('path')
const homeDir = require('os').homedir()

/**
 * Resolves a relative path to a full path based on the passed in loc
 * If it starts with `./`, path is resolved from the process.cwd()
 * If it starts with `~/`, path is resolved from users home directory
 * @param {string} loc - Path to be resolved
 * @param {string} [fromLoc=process.cwd()] - Relative paths are resolved from this location
 *
 * @returns {string} - Resolved full path 
 */
const resolveFullPath = (loc, fromLoc=process.cwd()) => {
  return loc.startsWith('./')
    ? path.join(fromLoc, loc)
    : loc.startsWith('~/')
      ? path.join(homeDir, loc)
      : loc
}

module.exports = {
  resolveFullPath
}