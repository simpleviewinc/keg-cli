const { get, deepMerge } = require('@ltipton/jsutils')

/**
 * Builds the internal arguments for the destroy service
 * @function
 * @param {Object} args - Default arguments passed to all tasks
 * @param {Object} argsExt - Arguments to override the passed in params
 *
 * @returns {Object} - Cloned arguments object
 */
const getServiceArgs = ({ params, __internal, ...args }, argsExt) => {
  const { __injected } = params
  return {
    ...args,
    __internal: {
      skipThrow: true,
      skipError: true,
      ...__internal,
    },
    params: deepMerge(
      params,
      argsExt,
      __injected,
      { force: true }
    )
  }
}

module.exports = {
  getServiceArgs
}