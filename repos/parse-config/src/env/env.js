const { parse, stringify } = require('./envParser')
const { limbo, isStr } = require('@keg-hub/jsutils')
const { throwError } = require('../error/throwError')
const { getContent, loadTemplate, mergeFiles, removeFile } = require('../utils')

/**
 * Parses the env content to replaces any template values from the data object
 * Then converts it into a JS Object with the `env.safeLoad` call
 * @function
 * @param {string} content - Content of the loaded env file
 *
 * @returns {Object} - Parse ENV file as a JS Object
 */
const loadTemplateEnv = (content, data, pattern) => {
  return loadTemplate(content, data, pattern, parse)
}

/**
 * Loads a ENV file from a path and parses it synchronously
 * @function
 * @param {string} location - Path to the ENV file
 * @param {string} data - Data to file the ENV file with, if it's a template
 * @param {RegEx} pattern - Pattern to match against template values
 * @param {boolean} throwError - If an error should be thrown when env file does not exist
 *
 * @returns {Object} - Parse ENV file
 */
const loadEnvSync = (location, data, pattern, throwErr=true) => {
  // Load the env file content
  const content = getContentSync(location, throwErr, `ENV`)
  // Treat it as a template and try to fill it
  return content ? loadTemplateEnv(content, data, pattern) : {}
}

/**
 * Loads a ENV file from a path and parses it
 * @function
 * @param {string} location - Path to the ENV file
 * @param {string} data - Data to file the ENV file with, if it's a template
 * @param {RegEx} pattern - Pattern to match against template values
 * @param {boolean} throwErr - If an error should be thrown when env file does not exist
 *
 * @returns {Object} - Parse ENV file
 */
const loadEnv = async (location, data, pattern, throwErr=true) => {
  // Load the env file content
  const content = await getContent(location, throwErr, `ENV`)
  // Load the env file
  return content ? loadTemplateEnv(content, data, pattern) : {}
}

/**
 * Loads multiple env files from an array of passed in files paths
 * <br/> Then merges them all together
 * @function
 * @param {Array} files - Array of env files paths to load
 *
 * @returns {Object} - Merged files as an Object
 */
const mergeEnv = async (...files) => {
  return await mergeFiles(files, loadEnv)
}

/**
 * Removes a env file from the local file system
 * @function
 * @param {Array} location - Path to the env file
 *
 * @returns {boolean} - If the file could be removed
 */
const removeEnv = async location => {
  return await removeFile(location, 'ENV')
}

/**
 * Writes a javascript object to a ENV file at the passed in path
 * Checks if the file exists first, then confirms overwrite
 * @function
 * @param {string} location - Location to write the ENV file to
 * @param {Object|Array} data - Data to write to the ENV file
 * @param {boolean} preConfirm - Bypass ask to overwrite existing file
 *
 * @returns {boolean} - If the ENV file could be written
 */
const writeEnv = async (location, data) => {
  const content = isStr(data) ? data : stringify(data)

  const [ err, _ ] = await limbo(writeEnv(location, content))
  return err ? throwError(err.stack) : true
}

module.exports = {
  loadEnv,
  loadEnvSync,
  mergeEnv,
  removeEnv,
  writeEnv,
  env: {
    load: loadEnv,
    loadSync: loadEnvSync,
    merge: mergeEnv,
    remove: removeEnv,
    write: writeEnv,
  }
}
