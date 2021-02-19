const { get, exists } = require('@keg-hub/jsutils')

/**
 * Maps the params that match the publish tasks to the publish args
 * @param {Object} args - arguments passed from the runTask method
 * @param {Array} args.params - arguments passed from the command line
 * @param {Object} args.globalConfig - Global config object for the keg-cli
 *
 * @return {Object} publishArgs with the params mapped to the tasks object
 */
const mapPublishTaskOptions = ({ globalConfig, params }) => {
  const publishArgs = { tasks: {} }

  Object.keys(get(globalConfig, `publish.default.tasks`))
    .map(key => exists(params[key]) && (publishArgs.tasks[key] = params[key]))

  return publishArgs
}

module.exports = {
  mapPublishTaskOptions
}