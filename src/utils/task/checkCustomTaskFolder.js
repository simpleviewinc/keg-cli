const path = require('path')
const { Logger } = require('KegLog')
const { findPathByName } = require('../helpers/findPathByName')
const { checkPathExists } = require('../helpers/checkPathExists')
/**
 * Checks if there is a tasks folder, to load the kegs custom tasks
 * @param {Object} globalConfig - Global config object for the keg-cli
 * @param {Object} tapObj - Config object for the linked tap
 * @param {string} tapObj.path - Path to the linked tap repo
 * @param {string} tapObj.tasks - Path to the custom tasks file 
 *
 * @returns {string} - Path to the custom tasks index.js file
 */
const checkCustomTaskFolder = async (globalConfig, tapObj) => {

  // Search for the tasks folder within the location path
  const [ foundPath ] = await findPathByName(
    path.join(tapObj.path),
    'tasks',
    { type: 'folder', recursive: false }
  )

  // Ensure we found a path to use
  if(!foundPath || !foundPath.length) return false

  // Check for the tasks index file
  const indexFile = path.join(foundPath, 'index.js')
  const indexFileExists = await checkPathExists(indexFile)

  // If a container/tasks folder but no index file, log a warning
  // Otherwise return the indexFile path
  return !indexFileExists
    ? Logger.warn(`Linked tap task folder exists, but index.js file is missing!`)
    : indexFile

}

module.exports = {
  checkCustomTaskFolder
}