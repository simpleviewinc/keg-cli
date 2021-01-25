const { testArray } = require('./testArray')
const { kegCmd, kegCmdAsync } = require('./kegCmd')
const { checkHelperMethod } = require('./checkHelperMethod')
const { eitherArr } = require('@keg-hub/jsutils')
/**
 * Calls the runTasks method for a taskGroup
 * @param {string} parentName - Name of the parent task group
 * @param {Object} runTasks - Group of cli tasks to be run
 *
 * @returns {Array<Object>} responses - Responses from the run tasks
 */
const runTaskTests = async (parentName, taskGroup, testResponses) => {
    // Check for the docker before tasks method
  await checkHelperMethod(taskGroup, 'beforeTasks')

  const responses = await taskGroup.runTasks(
    testArray(parentName, testResponses),
    kegCmd,
    kegCmdAsync
  )

  // Check for the docker after tasks method
  await checkHelperMethod(taskGroup, 'afterTasks')

  return responses
}

module.exports = {
  runTaskTests
}
