const { get } = require('@ltipton/jsutils')
const { getTask } = require('./getTask')
const { validateTask } = require('./validateTask')
const { GLOBAL_CONFIG_PATHS } = require('KegConst/constants')
const { TAP_LINKS } = GLOBAL_CONFIG_PATHS
const { getParams } = require('./getParams')
const { loadTapContainer } = require('./loadTapContainer')

/**
 * Checks if the command is a linked tap, and if so, calls the tap command on that tap
 * @function
 * @param {Object} globalConfig - Global CLI config
 * @param {Object} tasks - All CLI registered tasks
 * @param {string} command - Command to run
 * @param {Array} options - Command options passed in from the command line
 *
 * @returns {Object} - Found task and options
 */
const checkLinkedTaps = async (globalConfig, tasks, command, options) => {

  const tapPath = get(globalConfig, `${ TAP_LINKS }.${ command }`)
  // If no tap path was found, we have no task, so just return
  if(!tapPath) return false

  // Create a copy of the options so we don't modify the original
  options = [ ...options ]

  // Call getTask, and set the command to be tap
  const taskData = getTask(tasks, 'tap', ...options)

  // Get the params now instead of in executeTask
  // This way we can make all tap modification in one place
  taskData.params = await getParams({ ...taskData, params: { tap: command } })

  // Add the tap as the second-to-last option incase last option is the help option
  taskData.options.splice(taskData.options.length - 1, 0, `tap=${ command }`)

  // If we have a task to run, then check the tap for a container folder and load it
  taskData.task && await loadTapContainer({
    globalConfig,
    tap: command,
    tapPath,
    taskData
  })

  return taskData
}

/**
 * Gets the task from available tasks, If no task is found, checks if command is a tap
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
  return validateTask(taskData.task) && taskData

}

module.exports = {
  findTask
}