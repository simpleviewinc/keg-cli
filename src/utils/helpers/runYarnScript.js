const { Logger } = require('KegLog')
const { pipeCmd, spawnCmd } = require('KegProc')
const { checkCall, deepMerge, noOpObj, noPropArr } = require('@keg-hub/jsutils')

/**
 * Runs yarn script at a given location but pipes the output to a function
 * @function
 * @export
 * @public
 * @param {string} location - path to run the cmd
 * @param {string} script - the yarn command with options
 * @param {Object} opts - Options for the pipeCmd
 * @param {boolean} opts.log - Should log output
 * @param {Array<string>} opts.filter - String output that should not be logged
 * 
 * @returns {Boolean} - whether the cmd was successful or not
 */
const runYarnScriptPipe = async (location, script, opts=noOpObj) => {
  const { log, filter=noPropArr, title, ...config } = opts

  const cmd = `yarn ${script.trim()}`.trim()

  // Return a promise that is resolved when
  // the onExit method is called
  return new Promise(async (res, rej) => {
    const output = { data: [], error: [] }
    // Merge the passed in config with the default pipe config
    // Displays the bouncingBall animation while a command is being run 
    await pipeCmd(cmd, deepMerge({
      cwd: location,
      loading: {
        title: title || `${location} - ${cmd}`,
        active: false,
        type: 'bouncingBall',
      },
      onStdOut: data => {
        log &&
          !filter.includes(data.trim()) &&
          Logger.stdout(data)

        output.data.push(data)
      },
      onStdErr: data => {
        log && Logger.stderr(data)
        output.error.push(data)
      },
      onError: data => {
        log && Logger.stderr(data)
        output.error.push(data)
      },
      onExit: (exitCode) => {
        res({
          data: output.data.join(''),
          error: output.error.join(''),
          exitCode,
        })
      }
    }, config))
  })

}

/**
 * Runs yarn script at a given location
 * 
 * @function
 * @param {string} location - path to run the cmd
 * @param {string} script - the yarn command with options
 * @param {Function} errorCB - called if the yarn command throws an error
 * @param {Boolean} log - show log message or not
 * 
 * @returns {Boolean} - whether the cmd was successful or not
 */
const runYarnScript = async (location, script, errorCB, log) => {
  log && Logger.log(`Running yarn ${script.trim()}...`)

  // Run the yarn script from the package.json of the passed in location
  const exitCode = await spawnCmd(
    `yarn ${script.trim()}`.trim(),
    { cwd: location },
    false
  )

  // 0 = success, 1 = failure
  return exitCode
    ? checkCall(errorCB, exitCode, location, script)
    : exitCode || true
}

module.exports = {
  runYarnScript,
  runYarnScriptPipe
}