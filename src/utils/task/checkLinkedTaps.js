const { Logger } = require('KegLog')
const { getTask } = require('./getTask')
const { parseArgs } = require('KegUtils/helpers/parseArgs')
const { addTapLink } = require('../globalConfig/addTapLink')
const { constants: { GLOBAL_CONFIG_PATHS } } = require('KegRepos/cli-utils')
const { buildTaskData } = require('../builders/buildTaskData')
const { injectService } = require('../services/injectService')
const { get, isFunc, reduceObj } = require('@keg-hub/jsutils')
const { checkCustomTaskFolder } = require('./checkCustomTaskFolder')
const { TAP_LINKS } = GLOBAL_CONFIG_PATHS

/**
 * Looks for a tap/tasks folder if one is not defined in the globalConfig tap link
 * <br/> If one is found, it saves it to the globalConfig
 * @function
 * @private
 * @param {Object} globalConfig - Global CLI config
 * @param {string} tapName - Name of the tap being run
 * @param {Array} tapObj - Linked tap object from the global config
 *
 * @returns {Object} - Updated linked tap Object from the global config
 */
const checkAddCustomTasks = async (globalConfig, tapName, tapObj) => {
  const tasksFile = await checkCustomTaskFolder(globalConfig, tapObj)
  if(!tasksFile) return tapObj

  const tapMeta = { ...tapObj, tasks: tasksFile }
  addTapLink(globalConfig, tapName, tapMeta)

  return tapMeta
}

/**
 * Join the custom tasks with the keg-cli tasks
 * @function
 * @private
 * @param {Object} cliTasks - Default Keg-CLI tasks
 * @param {Object} tapTasks - Dynamically loaded tap tasks
 *
 * @returns {Object} - Merged tasks
 */
const mergeTapTasks = (cliTasks, tapTasks) => {
  const cliTapTasks = get(cliTasks, 'tap.tasks')

  Object.assign(
    cliTasks.tap.tasks,
    reduceObj(tapTasks, (name, definition, merged) => {
      Object.assign(merged, buildTaskData(
        definition,
        'tap',
        cliTapTasks
      ))

      return merged
    }, {})
  )

  return cliTasks
}

/**
 * Gets the custom tasks from the tap
 * @function
 * @private
 * @param {Object} args.globalConfig - Global CLI config
 * @param {Object} args.tasks - All CLI registered tasks
 * @param {string} args.command - Command to run
 * @param {Array} args.options - Command options passed in from the command line
 * @param {string} tasksPath - Path to the task index file 
 *
 * @returns {Object} - Found custom tasks
 */
const getCustomTasks = async (args, tapObj) => {
  try {

    if(!tapObj.tasks) return args.tasks

    // Try to load the custom tasks from the tasks path
    const loaded = require(tapObj.tasks)
    // Check if it's a function, and call it if needed
    const tasks = isFunc(loaded)
      ? await loaded(args)
      : loaded

    return mergeTapTasks(args.tasks, tasks)

  }
  catch(err){

    Logger.empty()
    Logger.warn(`Error loading custom tasks from path ${tapObj.tasks}`)
    Logger.error(err.stack)
    Logger.empty()

    process.exit(1)
  }
}

/**
 * Finds the task to run, and does any pre-run setup
 * @private
 * @function
 * @param {Object} globalConfig - Global CLI config
 * @param {Object} allTasks - All CLI registered tasks including custom tap tasks
 * @param {string} command - Command to run
 * @param {Array} options - Command options passed in from the command line
 *
 * @returns {Object} - Found task and options
 */
const setupTapTask = async ({ globalConfig, allTasks, command, options }) => {
  // Create a copy of the options so we don't modify the original
  options = [ ...options ]

  // Call getTask, and set the command to be tap
  const taskData = getTask(allTasks, 'tap', ...options)

  // Get the params now instead of in executeTask
  // This way we can make all tap modification in one place
  taskData.params = await parseArgs({
      ...taskData,
      command,
      params: { tap: command }
    }, globalConfig)

  return taskData
}

/**
 * Checks if the command is a linked tap, and if so, calls the tap command on that tap
 * @export
 * @function
 * @param {Object} globalConfig - Global CLI config
 * @param {Object} tasks - All CLI registered tasks
 * @param {string} command - Command to run
 * @param {Array} options - Command options passed in from the command line
 *
 * @returns {Object} - Found task and options
 */
const checkLinkedTaps = async (globalConfig, tasks, command, options) => {

  const tapObj = get(globalConfig, `${ TAP_LINKS }.${ command }`)

  // If no tap path was found, we have no task, so just return
  if(!tapObj || !tapObj.path) return false

  // If no tap tasks file path is defined, then try to find it
  const tapMeta = !tapObj.tasks
    ? await checkAddCustomTasks(globalConfig, command, tapObj)
    : tapObj

  // If no tap tasks file was found, just use default tasks
  // Otherwise load the custom tasks from the found path
  const allTasks = !tapMeta.tasks
    ? tasks
    : await getCustomTasks({
        globalConfig,
        tasks,
        command,
        options
      }, tapMeta)

  // Get the task, and params from the passed options
  const taskData = await setupTapTask({
    options,
    command,
    allTasks,
    globalConfig,
  })

  // Check if the tap task allows injection
  // If it does, try to load the taps container folder and inject it
  return !get(taskData, 'task.inject')
    ? taskData
    : await injectService({
        taskData,
        app: command,
        injectPath: tapObj.path,
      })
}

module.exports = {
  checkLinkedTaps
}