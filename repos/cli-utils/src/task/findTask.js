const { throwExitError } = require('../error')
const { noOpArr, isArr, isObj } = require('@keg-hub/jsutils')

/**
 * Maps task alias to a task name, relative to the options
 * @function
 * @private
 * @param {string} task - Name of the task to search for an alias
 * @param {Object} tasks - Custom Task Definitions
 *
 * @example
 * getTaskAlias({...task definition}, )
 *
 * @returns {Object} - Found task alias
 */
const getTaskAlias = (task, tasks) => {
  return Object.values(tasks)
    .find(definition => isArr(definition.alias) && definition.alias.includes(task))
}

/**
 * Loops over the options looking for a matching name to the passed in task
 * @function
 * @private
 * @param {Object} task - Custom Task Definition
 * @param {Array} options - Task options that can be shared across tasks
 *
 * @example
 * findTask({...task definition}, [...options])
 *
 * @returns {Object} - Found task definition by name
 */
const findTaskFromOptions = (task, options) => {
  const opt = options.shift()
  const subTasks = isObj(task) && task.tasks
  const subTask = opt && subTasks && (subTasks[opt] || getTaskAlias(opt, subTasks))

  return !subTask
    ? { task: task, options: opt ? [ opt, ...options ] : options }
    : findTaskFromOptions(subTask, options)
}

/**
 * Finds the correct task definition relative to the options
 * @function
 * @export
 * @param {Object} tasks - Custom Task Definitions
 * @param {Array} options - Task options that can be shared across tasks
 *
 * @example
 * findTask({...task definitions}, [...options])
 *
 * @returns {void}
 */
const findTask = (tasks, opts = noOpArr) => {
  const options = [...opts]
  const taskName = options.shift()
  const task = tasks[taskName] || getTaskAlias(taskName, tasks)
  const foundTask = task && findTaskFromOptions(task, options)

  return foundTask && foundTask.task
    ? foundTask
    : throwExitError(new Error(`Task not found for argument: ${taskName}`))
}

module.exports = {
  findTask,
}
