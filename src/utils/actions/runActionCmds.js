const { Logger } = require('KegLog')
const { get, isArr, isStr } = require('@keg-hub/jsutils')
const { runInternalTask } = require('../task/runInternalTask')
const { buildExecParams } = require('../docker/buildExecParams')

/**
 * Runs the sync actions defined in the mutagen.yml sync config
 * Runs each cmd in series, one after the other
 * @function
 * @param {Object} taskArgs - arguments passed from the runTask method
 * @param {string} cmdContext - Context of the container to sync with
 * @param {Array} action - Action to run in the container for the sync
 *
 * @returns {Array} - Array of Promises of each sync action
 */
const runActionCmds = (taskArgs, action, context) => {

  // Get the cmd || cmds to run
  const { cmds, cmd, ...actionParams } = action
  const log = get(taskArgs, 'params.log')

  // Normalize the cmds array
  const allCmds = isArr(cmds) ? cmds : isStr(cmds) ? [ cmds ] : []
  isStr(cmd) && allCmds.unshift(cmd)

  return allCmds.reduce(async (toResolve, toRun) => {
    await toResolve

    log && Logger.highlight(`Running action:`, `"${ toRun }"`)

    // Run the docker exec task for each cmd
    return runInternalTask('tasks.docker.tasks.exec', {
      ...taskArgs,
      params: {
        ...taskArgs.params,
        context: context || get(taskArgs, 'params.context'),
        ...buildExecParams(
          taskArgs.params,
          actionParams
        ),
        cmd: toRun,
      },
    })

  }, Promise.resolve())

}

module.exports = {
  runActionCmds
}