const { reduceObj, snakeCase, styleCase } = require('jsutils')

/**
 * Builds the mount path for the sync between the local host and docker container
 * @function
 * @param {string} args.from - Location on the local host to be synced
 * @param {string} args.to - Location on the docker container to be synced
 * @param {string} args.container - The id of the container to sync with
 * @param {string} args.type - The id of the container to sync with
 *
 * @returns {string} - Joined create arguments as a string
 */
const buildMountPath = ({ from, to, container, type='docker' }) => {
  const toPath = container ? `${ container }/${ to }` : to
  const fullToPath = type ? `${ type }://${ toPath }` : toPath

  return `${ from } ${ fullToPath }`
}


/**
 * Builds the ignore arguments for the create command 
 * @function
 * @param {Array} ignore - Array of paths to ignore
 *
 * @returns {string} - Joined ignore arguments as a string
 */
const buildIgnore = (ignore=[]) => {
  return ignore.reduce((ignored, ignore) => {
    return !ignore
      ? ignored
      : ignored
        ? `${ ignored } --ignore=${ ignore }`.trim()
        : `--ignore=${ ignore }`.trim()
  }, false)
}

/**
 * Builds the argument for the create command 
 * @function
 * @param {Array} ignore - Array of paths to ignore
 * @param {Object} create - Key/Values Arguments object for the create command
 *
 * @returns {string} - Joined create arguments as a string
 */
const buildMutagenArgs = ({ ignore, create }) => {
  let mutagenArgs = `${ buildIgnore(ignore) }`.trim()

  return reduceObj(create, (key, value, args) => {
    return value === true
      ? `${ args } --${ styleCase(snakeCase(key)) }`
      : value !== null && value !== undefined
        ? `${ args } --${ styleCase(snakeCase(key)) }=${ value }`
        : args
  }, mutagenArgs)
}

module.exports = {
  buildIgnore,
  buildMountPath,
  buildMutagenArgs,
}