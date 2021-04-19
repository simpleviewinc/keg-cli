#!/usr/bin/env node

const { getTaskDefinitions } = require('./tasks')
const { argsParse } = require('@keg-hub/args-parse')
const { deepMerge } = require('@keg-hub/jsutils')
const { findTask } = require('./task/findTask')
const { throwExitError } = require('./error')
const { getKegGlobalConfig } = require('./task/getKegGlobalConfig')

const defParams = { env: process.env.NODE_ENV || 'development' }

/**
 * Runs a local task matching the Keg-CLI task definition
 * This allows the tasks to be injected into the Keg-CLI when installed
 * @param {Object} customTasks - Custom tasks to add to the task cache
 * @param {Object} customDefParams - Default params added to all tasks
 *
 * @returns {Any} - Output of the executed task
 */
const runTask = async (customTasks, customDefParams) => {
  const globalConfig = getKegGlobalConfig(false)

  try {
    const args = process.argv.slice(2)
    const Definitions = await getTaskDefinitions(customTasks)
    const { task, options } = findTask(Definitions, [...args])

    // Parse the args with the same package as the Keg-CLI, to ensure its consistent
    const params = await argsParse({
      task,
      args: [...options],
      params: deepMerge(defParams, customDefParams)
    })

    // Call the task action, and pass in args matching the same as the Keg-CLI args
    const response = await task.action({
      task,
      params,
      options,
      globalConfig,
      command: args[0],
      tasks: Definitions,
    })

    return response
  }
  catch (err) {
    throwExitError(err)
  }
}

// Check if the parent module ( task module ) has a parent
// If it does, then it was called by the Keg-CLI
// So we should return the task definition instead of running the task action
module.parent
  ? (module.exports = { runTask })
  : runTask()
