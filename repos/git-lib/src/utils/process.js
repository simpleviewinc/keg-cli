const { execCmd, spawnCmd } = require('@keg-hub/cli-utils')

/**
 * Spawns a new process to run a passed in cmd
 * @param {Array} args - Arguments to run a command
 * @param {string} args.cmd - Command to be passed to the node child process
 * @param {Array|Object*} args.options - Options to pass to the node child process
 * @param {string*} args.location - Path the child process will use as the cwd
 *
 * @returns {*} - Response from spawned process
 */
const spawnProc = (...args) => {
  return args.length === 1
    ? spawnCmd(...args, {}, process.cwd())
    : spawnCmd(...args)
}

/**
 * Executes an inline async call to the command line
 * @param {string} cmd - Command to be run
 * @param {Array} args - Arguments to run a command
 * @param {Array|Object*} args.options - Options to pass to the node child process
 * @param {string*} args.location - Path the child process will use as the cwd
 *
 * @returns {*} - Response from async exec cmd
 */
const executeCmd = (cmd, ...args) => {
  // Get the options and location from the args
  const [ options={}, location=process.cwd() ] = args

  // Ensure the cwd is set
  options.cwd = options.cwd || location

  return execCmd(cmd, options)
}

module.exports = {
  spawnCmd,
  spawnProc,
  executeCmd,
}