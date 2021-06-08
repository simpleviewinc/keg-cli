const { throwError } = require('../error')
const { fileSys } = require('@keg-hub/cli-utils')
const { parse, stringify } = require('./envParser')
const { isStr, noOpObj, noPropArr } = require('@keg-hub/jsutils')
const {
  getContent,
  getContentSync,
  loadTemplate,
  mergeFiles,
  removeFile,
  resolveArgs,
} = require('../utils')

/**
 * Loads a ENV file from a path and parses it synchronously
 * @function
 * @param {Object|string} args - Arguments that describe what file to load
 * @param {Object} args.data - Data to file the file with, if it's a template
 * @param {string} args.format - Type that should be returned ( string || Object )
 * @param {boolean} args.fill - Should the content be treated as a template
 * @param {RegEx} args.pattern - Pattern to match against template values
 * @param {string} args.location - Path to the ENV file
 * @param {RegEx} args.pattern - Pattern to match against template values
 * @param {boolean} [args.error=true] - Should errors be thrown
 *
 * @returns {Object|string} - Parse ENV file
 */
const loadEnvSync = args => {
  const { location, error } = resolveArgs(args)
  // Load the env file content
  const content = getContentSync(location, error, `ENV`)

  return loadTemplate(args, content, parse)
}

/**
 * Loads a ENV file from a path and parses it
 * @function
 * @param {Object|string} args - Arguments that describe what file to load
 * @param {Object} args.data - Data to file the file with, if it's a template
 * @param {string} args.format - Type that should be returned ( string || Object )
 * @param {boolean} args.fill - Should the content be treated as a template
 * @param {RegEx} args.pattern - Pattern to match against template values
 * @param {string} args.location - Path to the ENV file
 * @param {RegEx} args.pattern - Pattern to match against template values
 * @param {boolean} [args.error=true] - Should errors be thrown
 *
 * @returns {Object|string} - Parse ENV file
 */
const loadEnv = async args => {
  const { location, error } = resolveArgs(args)
  // Load the env file content
  const content = await getContent(location, error, `ENV`)

  return loadTemplate(args, content, parse)
}

/**
 * Loads multiple env files from an array of passed in files paths
 * <br/> Then merges them all together
 * @function
 * @param {Array} args.files - Array of env files paths to load
 * @param {string} args.data - Data to file the ENV file with, if it's a template
 * @param {RegEx} args.pattern - Pattern to match against template values
 * @param {boolean} args.error - If an error should be thrown when env file does not exist
 *
 * @returns {Object} - Merged files as an Object
 */
const mergeEnv = async args => {
  return await mergeFiles({
    data: noOpObj,
    files: noPropArr,
    ...args,
    loader: loadEnv,
  })
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
  const [err] = await fileSys.writeFile(location, content)
  return err ? throwError(err.stack) : true
}

module.exports = {
  loadEnv,
  loadEnvSync,
  mergeEnv,
  parseEnv: parse,
  removeEnv,
  stringifyEnv: stringify,
  writeEnv,
  env: {
    load: loadEnv,
    loadSync: loadEnvSync,
    merge: mergeEnv,
    parse,
    remove: removeEnv,
    stringify,
    write: writeEnv,
  },
}
