
/**
 * Maps the passed in context envs keys to the current process envs
 * This allows overwriting the envs from the command line
 * @function
 * @param {Object} contextEnvs - ENVs for the current context loaded from .env or value.yml files
 *
 * @returns {Object} - contextEnvs with their values overriden by process envs when they exist
 */
const mapProcessEnvsToContextEnvs = contextEnvs => {
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