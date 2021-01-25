#!/usr/bin/env node

// Update the Max listeners, to ensure all processes can exit properly
require('events').EventEmitter.defaultMaxListeners = 0

require('module-alias/register')
require('KegConst/constants')

const testTasks = require('./tasks')
const { logTests } = require('./helpers/logTests')
const { runTaskTests } = require('./helpers/runTaskTests')

/**
 * Gets the tasks to be run from the passed in arguments
 * @returns {Object} Tasks to be run
 */
const getTasksToRun = () => {
  // Get the passed in arguments passed form the command line
  const [ tasksToRun='all' ] = process.argv.slice(2)
  return tasksToRun.split(',')
    .reduce((runTasks, task) => {
      runTasks[task] = true

      return runTasks
    }, {})
}

(async () => {
  const toRun = getTasksToRun()
  const testResponses = { responses: [] }
  await Object.entries(testTasks)
    .reduce(async (toResolve, [ name, testObj ]) => {
      const responses = await toResolve
      const response = (toRun[name] || toRun.all)
        ? await runTaskTests(name, testObj, testResponses)
        : []

      return responses.concat(response)
    }, Promise.resolve([]))

  logTests(testResponses)

})()