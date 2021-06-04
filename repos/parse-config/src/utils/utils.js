const { throwError } = require('../error')
const { execTemplate } = require('../template')
const { noOp, deepMerge, isStr } = require('@keg-hub/jsutils')
const { pathExistsSync, pathExists, remove, readFileSync, readFile } = require('fs-extra')

/**
 * Catches EFBBBF (UTF-8 BOM) because the buffer-to-string
 * conversion translates it to FEFF (UTF-16 BOM)
 * @function
 * @param {string} content - Content of the loaded env file
 *
 * @returns {Object} - stripped string
 */
const stripBom = content => (
  content.charCodeAt(0) === 0xFEFF ? content.slice(1) : content
)

/**
 * Checks it the passed in location exists on th local file system
 * @type {function}
 * @throws
 * @param {string} location - Path to the file
 * @param {boolean} throwErr - If an error should be thrown when file does not exist
 * @param {string} type - Type of file that's being loaded
 *
 * @returns {boolean} - True if the file exists
 */
const checkExists = async (location, throwErr=true, type) => {
  const [ err, _ ] = await limbo(pathExists(location))

  return !err
    ? true
    : throwErr
      ? throwNoFile(location, `Could not load ${type} file!`) 
      : false
}

/**
 * Gets the content of a file from the passed in location synchronously
 * @type {function}
 * @throws
 * @param {string} location - Path to the file
 * @param {boolean} throwErr - If an error should be thrown when file does not exist
 * @param {string} type - Type of file that's being loaded
 *
 * @returns {string} - Loaded file content
 */
const getContentSync = (location, throwErr=true, type) => {
  return pathExistsSync(location)
    ? readFileSync(location)
    : throwError
      ? throwNoFile(location, `Could not load ${type} file!`)
      : null
}


/**
 * Gets the content of a file from the passed in location
 * @type {function}
 * @throws
 * @param {string} location - Path to the file
 * @param {boolean} throwErr - If an error should be thrown when file does not exist
 * @param {string} type - Type of file that's being loaded
 *
 * @returns {string} - Loaded file content
 */
const getContent = async (location, throwErr=true, type) => {
  const exists = await checkExists(location, throwErr=true, type)
  if(!exists) return ''

  // Get the content of the file
  const [ err, content ] = await readFile(location)

  return !err
    ? content
    : throwErr
      ? throwError(location, `Could not load ${type} file!`) 
      : null
}

/**
 * Removes a file from the local file system
 * @function
 * @throws
 * @param {Array} location - Path to the file
 *
 * @returns {boolean} - If the file could be removed
 */
const removeFile = async (location, type) => {
  !isStr(location) &&
    throwError(`Remove ${type} file requires a file location, instead got:\n`, `\t${location}`)

  const [ err, removed ] = await remove(location)
  return err ? throwError(err) : removed
}

/**
 * Loads multiple files from an array of passed in files paths
 * Then merges them all together
 * @function
 * @param {Array} files - Array of files paths to load
 * @param {function} loader - callback to load the file, should return an object 
 *
 * @returns {Object} - Merged files as an Object
 */
const mergeFiles = async (files, loader=noOp) => {
  const loaded = await Promise.all(
    await files.reduce(async (toResolve, file) => {
      const loaded = await toResolve
      const loadedYml = await (isStr(file) && loader(file))
      loadedYml && loaded.push(loadedYml)

      return loaded
    }, Promise.resolve([]))
  )

  return deepMerge(...loaded)
}

/**
 * Treats the passed in content as a template and tries to fill it using the data object
 * Then calls the loader function to load the content as an object
 * @type {function}
 * @param {string} content - Text content to be filled
 * @param {Object} data - Data to file the file with, if it's a template
 * @param {RegEx} pattern - Pattern to match against template values
 * @param {function} loader - Callback function to load the content after it's filled
 *
 * @returns {Object|*} - Response from the loader callback
 */
const loadTemplate = (content, data, pattern, loader) => {
  return loader(execTemplate(
    stripBom(content),
    data,
    pattern
  ))
}

module.exports = {
  getContent,
  getContentSync,
  loadTemplate,
  mergeFiles,
  removeFile,
  stripBom
}
