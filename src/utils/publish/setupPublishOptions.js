const { get, reduceObj } = require('@keg-hub/jsutils')
const defaultConfig = require('KegScripts/setup/cli.config.json')
const publishTasks = get(defaultConfig, 'publish.default.tasks')

/**
 * Setup the options object based on the user's keg config
 * 
 * @function
 * @param {Object} tasks - key = task, value = default val. example: { publish: true }
 * 
 * @returns {null|Object}
 */
const setupPublishOptions = (tasks, taskName='hub') => {
  // For each task, generate option obj with generic description
  return reduceObj(tasks || publishTasks, (key, value, options) => {
    options[key] = {
      description: `Will perform ${key} task during the publish service`,
      example: `keg ${taskName} publish --${key}`,
    }

    return options
  })
}

module.exports = {
  setupPublishOptions
}