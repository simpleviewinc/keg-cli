const { Logger } = require('../logger/logger')
const { noOpObj } = require('@keg-hub/jsutils')

/*
 * Helper to log an error message
 * @function
 * @param {Object} message - Data to be logged as an error
 *
 * @returns {void}
 */
const throwError = (...message) => {
  Logger.error(`\n ${message.join('\n ')}\n`)

  throwTaskFailed()
}

/**
 * Helper to print an error on task failed
 *
 * @param {Error|Object} err - Error that was thrown
 *
 * @returns {void}
 */
const throwExitError = (err=noOpObj) => {
  Logger.header(`Task Error:`)
  err.stack
    ? Logger.error(`  ${err.stack}`)
    : Logger.error(`  An unknown error occurred!`)
  Logger.empty()

  process.exit(1)
}

/**
 * Throws an error when a task's action is called, but its missing
 * @function
 * @private
 * @param {Object} task - Task definition that's missing an action property
 * @returns {void}
 */
const throwNoAction = (task=noOpObj) => {
  Logger.error(
    `\n Task '${task.name}' requires a valid sub-task. No action exists for this task!`
  )

  task.alias && Logger.pair(`  * Alias:`, task.alias.join(' | '))
  task.description && Logger.pair(`  * Description:`, task.description)
  task.example && Logger.pair(`  * Example:`, task.example)
  task.tasks &&
    Logger.pair(`  * Subtasks:`, Object.keys(task.tasks).join(' | '))

  Logger.empty()

  throwTaskFailed()
}

/**
 * Throws task failed error
 * @function
 * @private
 *
 * @returns {void}
 */
const throwTaskFailed = () => {
  throw new Error(`Task failed!`)
}

module.exports = {
  throwError,
  throwExitError,
  throwNoAction,
  throwTaskFailed,
}
