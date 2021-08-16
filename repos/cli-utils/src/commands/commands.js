const { getAppRoot } = require('../appRoot')
const { Logger } = require('../logger/logger')
const { isArr, noOpObj, noPropArr, camelCase, isStr, exists } = require('@keg-hub/jsutils')
const { spawnCmd, asyncCmd:execCmd } = require('@keg-hub/spawn-cmd')

/**
 * Ensures the passed in data is an array
 * If data is not an array, it must has a split method to convert to an array
 * @function
 * @private
 * @param {string|Array} [data=[]] - Data to ensure is an array
 *
 * @returns {Array} - Data converted to an array
 */
const ensureArray = (data=noPropArr) => (
  !exists(data)
    ? noPropArr
    : isArr(data)
      ? data
      : isStr(data)
        ? data.split(' ')
        : Logger.error(
            `The runCmd method requires arguments be an Array or string.\n`,
            `Instead got ${typeof data}: ${data}\n`,
            `Args will be ignored!\n`,
          ) || noPropArr
)

/**
 * Runs a child process using spawnCmd
 * Passes along the current process.env object
 * @function
 * @private
 * @param {string} cmd - Command to run in the child process
 * @param {Array} args - Arguments to pass to the cmd within the child process
 * @param {Object} options - Options forwarded to the child process
 * @param {string} cwd - Directory where the child process should be run from
 * @param {boolean} asExec - Run command with execCmd instead of spawnCmd
 *
 * @returns {Object|undefined} - Object is exec is true, undefined if false
 */
const runCmd = async (cmd, args=noPropArr, options=noOpObj, cwd, asExec) => {
  const {
    exec,
    onStdOut,
    onStdErr,
    onError,
    onExit,
    ...opts
  } = options

  return (exec || asExec)
    ? await execCmd(
        `${cmd} ${ensureArray(args).join(' ')}`,
        { ...opts, env: { ...process.env, ...opts.env } },
        cwd || getAppRoot()
      )
    : await spawnCmd(cmd, {
        onStdOut,
        onStdErr,
        onError,
        onExit,
        args: ensureArray(args),
        options: { ...opts, env: { ...process.env, ...opts.env } },
        cwd: cwd || getAppRoot(),
      })
}

/**
 * Generates helper methods for calling common executables within a child process
 * @Object
 */
const shortcutCmds = Array.from([
  'npm',
  'npx',
  'yarn',
  'docker',
  'docker-compose',
])
.reduce((cmds, cmd) => {
  /**
   * Creates a helper to call the executable within a child process
   * @param {Array|string} args - Arguments to pass to the npm command
   */
  cmds[camelCase(cmd)] = (args, ...opts) => runCmd(cmd, args, ...opts)

  return cmds
}, {})

/**
 * Helper to call the docker exec command directly
 * @param {String} containerName - name of container to run command within
 * @param {Array<string>} args - docker exec args
 * @param  {...any} opts - docker exec opts
 * @example
 * dockerExec('<container-name>', 'yarn install')
 */
const dockerExec = (containerName, args, ...opts) => {
  const allArgs = [ 'exec', '-it', containerName, ...ensureArray(args) ]
  return runCmd('docker', allArgs, ...opts)
}

module.exports = {
  execCmd,
  runCmd,
  spawnCmd,
  dockerExec,
  ...shortcutCmds,
}
