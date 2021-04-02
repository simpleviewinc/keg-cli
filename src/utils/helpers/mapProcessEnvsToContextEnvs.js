
/**
 * Maps the passed in context envs keys to the current process envs
 * This allows overwriting the envs from the command line
 * Container specific envs must be prefixed with their container name
 * @example
 * BASE_CONTAINER_NAME=root
 * - Only the base container name would be overridden 
 * - All other containers envs would NOT be
 * @function
 * @param {Object} contextEnvs - ENVs for the current context loaded from .env or value.yml files
 * @param {Object} context - Container context name of the envs
 *
 * @returns {Object} - contextEnvs with their values overridden by process envs when they exist
 */
const mapProcessEnvsToContextEnvs = (contextEnvs, prefix) => {
  // TODO: add a prefix to container specific envs
  // Container specific envs should be defined in KegConstants then checked here
  return Object.keys(contextEnvs)
    .reduce((mapped, key) => {
      const procVal = process.env[key]

      mapped[key] = !procVal || procVal === 'undefined' || procVal === contextEnvs[key]
        ? contextEnvs[key]
        : procVal

      return mapped
    }, {})
}

module.exports = {
  mapProcessEnvsToContextEnvs
}