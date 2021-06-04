const yaml = require('js-yaml')
const { limbo } = require('@keg-hub/jsutils')
const writeYamlFile = require('write-yaml-file')
const { throwError } = require('../error/throwError')
const { getFileContent, loadTemplate, mergeFiles, removeFile } = require('../utils')

/**
 * Parses the yml content to replaces any template values from the data object
 * Then converts it into a JS Object with the `yaml.safeLoad` call
 * @function
 * @param {string} content - Content of the loaded yml file
 *
 * @returns {Object} - Parse YML file as a JS Object
 */
const loadTemplateYml = (content, data, pattern) => {
  return loadTemplate(content, data, pattern, yaml.safeLoad)
}

/**
 * Loads a YML file from a path and parses it synchronously
 * @function
 * @param {string} location - Path to the YML file
 * @param {string} data - Data to file the YML file with, if it's a template
 * @param {RegEx} pattern - Pattern to match against template values
 * @param {boolean} throwErr - If an error should be thrown when yml file does not exist
 *
 * @returns {Object} - Parse YML file
 */
const loadYmlSync = (location, data, pattern, throwErr=true) => {
  // Load the yaml file content
  const content = getContentSync(location, throwErr, `Yml`)
  // Treat it as a template and try to fill it
  return content ? loadTemplateYml(content, data, pattern) : {}
}

/**
 * Loads a YML file from a path and parses it
 * @function
 * @param {string} location - Path to the YML file
 * @param {string} data - Data to file the YML file with, if it's a template
 * @param {RegEx} pattern - Pattern to match against template values
 * @param {boolean} throwErr - If an error should be thrown when yml file does not exist
 *
 * @returns {Object} - Parse YML file
 */
const loadYml = async (location, data, pattern, throwErr=true) => {
  // Load the yaml file content
  const content = await getFileContent(location, throwErr, `Yml`)
  // Treat it as a template and try to fill it
  return content ? loadTemplateYml(content, data, pattern) : {}
}

/**
 * Writes a javascript object to a YML file at the passed in path
 * Checks if the file exists first, then confirms overwrite
 * @function
 * @throws
 * @param {string} location - Location to write the YML file to
 * @param {Object|Array} data - Data to write to the YML file
 * @param {boolean} preConfirm - Bypass ask to overwrite existing file
 *
 * @returns {boolean} - If the YML file could be written
 */
const writeYml = async (location, data) => {
  const [ err, _ ] = await limbo(writeYamlFile(location, data))
  return err ? throwError(err.stack) : true
}

/**
 * Loads multiple yml files from an array of passed in files paths
 * Then merges them all together
 * @function
 * @param {Array} files - Array of yml files paths to load
 *
 * @returns {Object} - Merged files as an Object
 */
const mergeYml = async (...files) => {
  return await mergeFiles(files, loadYml)
}

/**
 * Removes a yml file from the local file system
 * @function
 * @param {Array} location - Path to the yml file
 *
 * @returns {boolean} - If the file could be removed
 */
const removeYml = async location => {
  return await removeFile(location, 'Yml')
}

module.exports = {
  loadYml,
  loadYmlSync,
  mergeYml,
  removeYml,
  writeYml,
  yml: {
    load: loadYml,
    loadSync: loadYmlSync,
    merge: mergeYml,
    remove: removeYml,
    write: writeYml,
  }
}
