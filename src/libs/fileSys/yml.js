const { limbo, deepMerge, isStr } = require('jsutils')
const loadYamlFile = require('load-yaml-file')
const writeYamlFile = require('write-yaml-file')
const { parse:parseYml, stringify:toYml, } = require('yamljs')
const { pathExistsSync, removeFile } = require('./fileSys')
const { ask } = require('../questions')
const { throwNoFileExists, generalError } = require('KegUtils/error')
const { confirmExec } = require('KegUtils/helpers')

/**
 * Loads a YAML file from a path and parses it
 * @function
 * @param {string} filePath - Path to the YAML file
 * @param {boolean} throwError - If an error should be thrown when yml file does not exist
 *
 * @returns {Object} - Parse YAML file
 */
const loadYml = async (filePath, throwError=true) => {
  const [ err, data ] = pathExistsSync(filePath)
    ? await limbo(loadYamlFile(filePath))
    : [ throwError ? throwNoFileExists(filePath, `Could not load YAML file!`) : null, {} ]

  return data
}

/**
 * Writes a javascript object to a YAML file at the passed in path
 * Checks if the file exists first, then confirms overwrite
 * @function
 * @param {string} filePath - Location to write the YAML file to
 * @param {Object|Array} data - Data to write to the YAML file
 * @param {boolean} preConfirm - Bypass ask to overwrite existing file
 *
 * @returns {boolean} - If the YAML file could be written
 */
const writeYml = async (filePath, data, preConfirm) => {
  return confirmExec({
    confirm: `Overwrite YAML file => ${filePath}?`,
    success: `YAML file written successfully!`,
    cancel: `Write YAML file canceled!`,
    preConfirm: preConfirm || !pathExistsSync(filePath),
    execute: async () => {
      const [ err, _ ] = await limbo(writeYamlFile(filePath, data))
      return err ? generalError(err.stack) : true
    },
  })
}

/**
 * Loads multiple yml files from an array of passed in files paths
 * <br/> Then merges them all together
 * @function
 * @param {Array} ymlFiles - Array of files paths to load
 *
 * @returns {Object} - Merged ymlFiles as an Object
 */
const mergeYml = async (...ymlFiles) => {

  const loadedYmls = await Promise.all(
    await ymlFiles.reduce(async (toResolve, file) => {
      const loaded = await toResolve
      const loadedYml = await isStr(file) && loadYml(file)
      loadedYml && loaded.push(loadedYml)

      return loaded
    }, Promise.resolve([]))
  )

  return deepMerge(...loadedYmls)

}

/**
 * Removes a yml file from the local file system
 * @function
 * @param {Array} filePath - Path to the yml file
 *
 * @returns {boolean} - If the file could be removed
 */
const removeYml = async filePath => {
  !isStr(filePath) && generalError(`Yaml remove requires a string file path!`, filePath)

  const [ err, removed ] = await removeFile(filePath)
  return err ? generalError(err) : removed
}

const yml = {
  load: loadYml,
  merge: mergeYml,
  parse: parseYml,
  remove: removeYml,
  stringify: toYml,
  write: writeYml,
}

module.exports = {
  loadYml,
  mergeYml,
  parseYml,
  removeYml,
  toYml,
  writeYml,
  yml,
}