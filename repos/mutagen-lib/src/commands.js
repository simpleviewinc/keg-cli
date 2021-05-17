const { isArr, toStr } = require('@keg-hub/jsutils')
const { cliError, cliSuccess } = require('./helpers')
const { execCmd, runCmd, Logger } = require('@keg-hub/cli-utils')

/**
 * Calls the mutagen cli from the command line and returns the response
 * @function
 * @param {string} cmd - mutagen command to be run
 *
 * @returns {string} - cmd with mutagen added
 */
const ensureMutagen = cmd => cmd.trim().indexOf('mutagen') === 0 ? cmd : `mutagen ${cmd}`


/**
 * Calls the mutagen cli from the command line and returns the response
 * @function
 * @param {Object} args - arguments used to modify the mutagen api call
 * @param {Object} args.opts - optional arguments to pass to the mutagen command
 * @param {Object} args.asObj - Return the response as an unformatted string
 * @param {Object} args.log - Log the mutagen command being run before running it
 * @param {Object} args.skipError - Skip showing an error if the mutagen command fails
 * @param {Object} [args.format=''] - Format the output of the mutagen command
 * @param {Object} args.force - Pass "--force" to the mutagen command, to force the operation
 * @param {Object} args.errResponse - On an error calling mutagen, this will be returned.
 *                                      If errResponse is undefined, the current process will exit
 *
 * @returns {Array|string} - JSON array of items || stdout from mutagen cli call
 */
const mutagenCli = async (args={}, cmdOpts={}, location) => {
  const { format, log, opts, skipError, isList } = args

  const options = isArr(opts) ? opts.join(' ').trim() : toStr(opts)
  const cmdToRun = ensureMutagen(`${ options }`.trim())
  log && Logger.spacedMsg(`Running command: `, cmdToRun)

  const { error, data } = await execCmd(cmdToRun, cmdOpts, location)

  return error ? cliError(error, skipError) : cliSuccess(data, format, skipError, isList)

}

/**
 * Runs a raw terminal command by spawning a child process
 * <br/> Auto adds mutagen to the front of the cmd if it does not exist
 * @function
 * @param {string} cmd - mutagen command to be run
 * @param {string} args - Arguments to pass to the child process
 * @param {string} loc - Location where the cmd should be run
 * @param {boolean} log - Should log the output
 *
 * @returns {*} - Response from the mutagen cli command
 */
const raw = async (cmd, args={}, loc=process.cwd(), log) => {

  // Build the command to be run
  // Add mutagen if needed
  const toRun = ensureMutagen(cmd)

  // Run the mutagen command
  const { error, data } = await runCmd(toRun, args, {}, loc)

  error && !data
    ? cliError(error)
    : log && Logger.success(`Finished running Mutagen CLI command!`)
  
  return data
}


module.exports = {
  mutagenCli,
  raw,
}