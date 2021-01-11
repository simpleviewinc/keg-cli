const { getTask } = require('./getTask')
const { get } = require('@keg-hub/jsutils')
const { validateTask } = require('./validateTask')
const { hasHelpArg } = require('../helpers/hasHelpArg')
const { checkLinkedTaps } = require('./checkLinkedTaps')

/**
 * Gets the task from available tasks, If no task is found, checks if command is a tap
 * @export
 * @function
 * @param {Object} globalConfig - Global CLI config
 * @param {Object} tasks - All CLI registered tasks
 * @param {string} command - Command to run
 * @param {Array} options - Command options passed in from the command line
 *
 * @returns {Object} - Found task and options
 */
const findTask = async (globalConfig, tasks, command, options) => {

  // First check if the cmd is for a linked task
  const tapTaskData = await checkLinkedTaps(globalConfig, tasks, command, options)

  // Get the task from available tasks
  const foundTask = tapTaskData || getTask(tasks, command, ...options)

  // Ensure we have the taskData
  const taskData = get(foundTask, 'task') ? foundTask : {}

  // Validate the task, and return the taskData
  return validateTask(
    taskData.task,
    null,
    hasHelpArg(options[ options.length -1 ]),
  ) && taskData

}

module.exports = {
  findTask
}
