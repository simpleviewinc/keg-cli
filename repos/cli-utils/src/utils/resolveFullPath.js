const path = require('path')
const homeDir = require('os').homedir()
const curDir = process.cwd()

/**
 * Resolves a relative path to a full path based on the passed in loc
 * If it starts with `./`, path is resolved from the process.cwd()
 * If it starts with `~/`, path is resolved from users home directory
 * @param {string} loc - Path to be resolved
 *
 * @returns {string} - Resolved full path 
 */
const resolveFullPath = loc => {
  return loc.startsWith('./')
    ? path.join(curDir, loc)
    : loc.startsWith('~/')
      ? path.join(homeDir, loc)
      : loc
}

module.exports = {
  resolveFullPath
}