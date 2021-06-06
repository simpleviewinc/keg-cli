const { execTemplate } = require('../template')
const { throwError, throwNoFile } = require('../error')
const { noOp, noOpObj, deepMerge, isStr, limbo } = require('@keg-hub/jsutils')
const {
  pathExistsSync,
  pathExists,
  remove,
  readFileSync,
  readFile,
} = require('fs-extra')

const defLoaderArgs = {
  error: true,
  fill: true,
  // TODO: update data to include the global config and envs
  // Add cli-utils, and load the global config
  // Also add any other data matched to the keg-cli default data object
  data: noOpObj,
  format: 'object',
}

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
 * Parses the env content to replaces any template values from the data object
 * Then converts it into a JS Object with the `env.safeLoad` call
 * @function
 * @param {Object} [args.data={}] - Data to file the file with, if it's a template
 * @param {string} [args.format] - Type that should be returned ( string || Object )
 * @param {boolean} [args.fill=true] - Should the content be treated as a template
 * @param {RegEx} [args.pattern] - Pattern to match against template values
 * @param {string} [content] - Text content to be filled
 * @param {function} loader - Callback function to parse the content after it's filled
 *
 * @returns {Object} - Parse ENV file as a JS Object
 */
const loadTemplate = (args, content, loader) => {
  const { data=noOpObj, fill=true, format, pattern } = args

  if(!content) return format === 'string' ? '' : {}
 
  const cleaned = stripBom(content)
  const template = fill ? execTemplate(cleaned, data, pattern) : cleaned

  // Treat it as a template and try to fill it fill === true
  return format === 'string' ? template : loader(template)
}

/**
 * Ensures args is an object for file loading methods
 * If args is a string, will set it as the location
 * Sets other defaults where needed
 * @function
 * @param {string|Object} args - Path to a file or args object
 *
 * @returns {Object} - Args converted into an object if needed
 */
const resolveArgs = args => {
  return !isStr(args)
    ? deepMerge(defLoaderArgs, args)
    : defLoaderArgs(defLoaderArgs, { location: args })
}

module.exports = {
  getContent,
  getContentSync,
  loadTemplate,
  mergeFiles,
  removeFile,
  resolveArgs,
  stripBom,
}
