const { noOpObj } = require('@keg-hub/jsutils')
const { kegCmd, kegCmdAsync } = require('./kegCmd')
const { promiseTimeout } = require('./promiseTimeout')
const { checkHelperMethod } = require('./checkHelperMethod')
const { logSuccess, logFailed } = require('./logTests')

/**
* Returns a function that allows calling a group of tasks
* @param {string} parentName - Name of the parent task group
* @param {Array} testResponses - Bucket to store responses from tests
*
* @returns {function} Function to execute an array of tasks
*/
const testArray = (parentName, testResponses) => {
  /**
  * Loops over an array of Keg-CLI commands, and runs each one
  * @param {Object} cliTasks - Group of cli tasks to be run
  * @param {Object} options - Define settings for how to run the tasks
  * @param {boolean} options.log - Log the output of the run tasks
  *
  * @returns {Array<Object>} responses - Responses from the run tasks
  */
  return async (cliTasks, options=noOpObj) => {
    const { tasks, timeout } = cliTasks

    if(!tasks){
      console.error(`Found non-existent tasks array for ${parentName} module!`)
      return []
    }
    
    const { log } = options
    await checkHelperMethod(cliTasks, 'beforeTasks')

    const responses = await tasks.reduce(async (toResolve, cmd) => {
      const allPromises = await toResolve

      const response = kegCmd(cmd)
        .then(exitCode => ({
          cmd,
          exitCode,
          parent: parentName,
          response: exitCode !== 0 ? `Failed Execution` : `Executed Successfully!`
        }))
        .catch(exitCode => ({
          cmd,
          exitCode,
          parent: parentName,
          response: exitCode !== 0 ? `Failed Execution` : `Executed Successfully!`
        }))

      const raceResponse = await promiseTimeout(response, cmd, timeout)
        .then(data => {
          data.exitCode !== 0
            ? logFailed({ parent: parentName, cmd,  data })
            : logSuccess({ parent: parentName, cmd,  data })

          return data
        })

      allPromises.push(raceResponse)

      return allPromises
    }, Promise.resolve([]))

    // Settle all promises, and log the cmd response output
    const cmdResponses = await Promise.allSettled(responses)
      .then(settled => settled.map(data => data.value))
      .then(async data => {
        await checkHelperMethod(cliTasks, 'afterTasks', data)

        return data
      })

      // Update the global response data
      testResponses.responses = testResponses.responses.concat(cmdResponses)

      return cmdResponses
  }

}

module.exports = {
  testArray
}