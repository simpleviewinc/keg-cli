const { execTemplate } = require('../template')
const { throwError, throwNoFile } = require('../error')
const { noOp, deepMerge, isStr, limbo } = require('@keg-hub/jsutils')
const {
  pathExistsSync,
  pathExists,
  remove,
  readFileSync,
  readFile,
} = require('fs-extra')

/**
 * Catches EFBBBF (UTF-8 BOM) because the buffer-to-string
 * conversion translates it to FEFF (UTF-16 BOM)
 * @function
 * @param {string} content - Content of the loaded env file
 *
 * @returns {Object} - stripped string
 */
const stripBom = content =>
  content.charCodeAt(0) === 0xfeff ? content.slice(1) : content

/**
 * Checks it the passed in location exists on th local file system
 * @type {function}
 * @throws
 * @param {string} location - Path to the file
 * @param {boolean} error - If an error should be thrown when file does not exist
 * @param {string} type - Type of file that's being loaded
 *
 * @returns {boolean} - True if the file exists
 */
const checkExists = async (location, error = true, type) => {
  const exists = await pathExists(location)

  return exists
    ? true
    : error
      ? throwNoFile(location, `Could not load ${type} file!`)
      : false
}

/**
 * Gets the content of a file from the passed in location synchronously
 * @type {function}
 * @throws
 * @param {string} location - Path to the file
 * @param {boolean} error - If an error should be thrown when file does not exist
 * @param {string} type - Type of file that's being loaded
 *
 * @returns {string} - Loaded file content
 */
const getContentSync = (location, error = true, type) => {
  return pathExistsSync(location)
    ? readFileSync(location, { encoding: 'utf8' })
    : error
      ? throwNoFile(location, `Could not load ${type} file!`)
      : null
}

/**
 * Gets the content of a file from the passed in location
 * @type {function}
 * @throws
 * @param {string} location - Path to the file
 * @param {boolean} error - If an error should be thrown when file does not exist
 * @param {string} type - Type of file that's being loaded
 *
 * @returns {string} - Loaded file content
 */
const getContent = async (location, error = true, type) => {
  const exists = await checkExists(location, error, type)
  if (!exists) return null

  // Get the content of the file
  const [ err, content ] = await limbo(readFile(location, { encoding: 'utf8' }))

  return !err
    ? content
    : error
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
    throwError(
      `Remove ${type} file requires a file location, instead got: ${location}`
    )

  const [err] = await limbo(remove(location))
  return err ? throwError(err) : true
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
const mergeFiles = async ({ files, loader = noOp, ...args }) => {
  const loaded = await Promise.all(
    await files.reduce(async (toResolve, file) => {
      const loaded = await toResolve
      const loadedYml =
        isStr(file) && (await loader({ location: file, ...args }))

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
  return loader(execTemplate(stripBom(content), data, pattern))
}

module.exports = {
  getContent,
  getContentSync,
  loadTemplate,
  mergeFiles,
  removeFile,
  stripBom,
}
