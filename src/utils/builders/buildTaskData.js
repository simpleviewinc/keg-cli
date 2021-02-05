const { addGlobalOptions } = require('../task/globalOptions')
const { runInternalTask } = require('../task/runInternalTask')
const {
  deepClone,
  get,
  isArr,
  reduceObj,
  set,
  noOpObj,
  deepMerge
} = require('@keg-hub/jsutils')

/**
 * Builds a function for calling the default cli task from a custom task
 * @param {Object} namedTask - Current Task being built, to check for subTasks
 * @param {Object} task - Original task definition of namedTask
 * @param {Object} cliTask - Default task to be called
 * @param {string} taskPath - Object notation path to the current task
 
 *
 * @returns {function} - Function to call a default cli task from custom task
 */
const addCliTask = (namedTask, task, cliTask, taskPath) => {
  const tapTaskDef = namedTask[task.name]

  return !cliTask
    ? namedTask
    : { [task.name]: {
        // Merge the task definitions, so original task properties still exit
        ...cliTask,
        ...tapTaskDef,
        options: task.mergeOptions
          ? deepMerge(cliTask.options, tapTaskDef.options)
          : tapTaskDef.options,
        // Add the wrapper for the original cliTask, so it can still be called
        cliTask: args => runInternalTask(
          taskPath,
          { ...args, task: cliTask },
          cliTask
        ),
        // Merge the original cli sub-tasks, so they can still be called
        tasks: {
          ...cliTask.tasks,
          ...namedTask.tasks,
        },
      }}

}

/**
 * Calls buildTaskData on any subTasks of the passed in task
 * @param {Object} namedTask - Current Task being built, to check for subTasks
 * @param {string} task - Original task definition of namedTask
 * @param {Object} cliTasks - Default Keg-CLI tasks ( Only used within custom tap tasks )
 * @param {string} taskPath - Object notation path to the current task
 *
 * @returns {Object} - Task object with subTasks built
 */
const buildSubTasks = (namedTask, task, cliTasks, taskPath) => {
  // Next loop over any subtasks and do the same thing
  const subTasks = get(namedTask, `${task.name}.tasks`)

  // Build subTask alias by looping over each sub task and calling buildTaskData again
  subTasks &&
    set(namedTask, `${task.name}.tasks`, reduceObj(subTasks, (key, value, existingTasks) => ({
      ...existingTasks,
      ...buildTaskData(
        value,
        task.name,
        cliTasks[task.name],
        taskPath
      )
    }), subTasks))

  return namedTask
}

/**
 * Finds the alias for the task, and sets them to the namedTask object
 * @param {Object} namedTask - Current Task being built, to check for alias
* @param {string} task - Original task definition of namedTask
 *
 * @returns {Object} - Task object with alias added
 */
const buildTaskAlias = (namedTask, task) => {
  const alias = get(task, 'alias')

  // Loop over each alias, and map the alias name to the task original name
  // At the same level of the object
  return !isArr(alias)
    ? namedTask
    : alias.reduce((update, al) => {
        update[al] = task.name
        return update
      }, namedTask)
}

/**
 * Finds the alias of passed in task, and adds it to the task object with reference to same value
 * @param {Object} task - Task with alias
 * @param {string} parent - Name of parent task
 * @param {Object} cliTasks - Default Keg-CLI tasks ( Only used within custom tap tasks )
 * @param {string} taskPath - Object notation path to the current task
 *
 * @returns {Object} - Tasks object with name and alias set
 */
const buildTaskData = (task, parent, cliTasks=noOpObj, taskPath) => {
  if(!task.name)
  throw new Error(
    `Required task name could not be found for task: ${JSON.stringify(task, null, 2)}`
  )

  // Add the parent named reference to the task object
  task.parent = task.parent || parent

  // Update the task path with the name of the current task
  taskPath = taskPath
    ? `${taskPath}.tasks.${task.name}`
    : `${task.parent}.tasks.${task.name}`

  // Wrap the task be it's name into a new object
  // This way we can add the alias to the same object at the same level as the default task
  // Then when an alias is used to run a task
  // We can find the real task at the same level of the alias
  const namedTask = buildTaskAlias({ [task.name]: task }, task)

  // Build the taskData subtasks if they exist
  const builtTask = buildSubTasks(namedTask, task, cliTasks, taskPath)

  // Check if the cliTasks object exists, and matching cli task as a property of the namedTask
  // This give custom taps tasks access to the cliTask with the same name when needed
  const withCliTask = cliTasks[task.name]
    ? addCliTask(builtTask, task, cliTasks[task.name], taskPath)
    : builtTask

  // Add the global options for every tasks, and return
  return addGlobalOptions(withCliTask, task.name, parent)

}

module.exports = {
  buildTaskData
}