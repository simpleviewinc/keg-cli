
const { FILTERS } = require('KegConst/filters')
const { get, checkCall, deepMerge, isFunc } = require('jsutils')
const { spawnCmd } = require('spawn-cmd')

const defLogConf = {
  active: true,
  setActive: undefined,
  filters: [ ...FILTERS.DEFAULT ],
}

/**
 * Checks if logging is active, or if it should be come active
 * <br/> Checks the current data to be logged, to see if it's the logging activator
 * @param {Object} config - Log Config for the currently running process
 * @param {string} data - Text to be printed if not filtered
 *
 * @returns {boolean} - True if logging is active / False if logging is not active
 */
const checkActive = (config, data) => {
  !config.active &&
    data.trim().indexOf(config.setActive) !== -1 &&
    ( config.active = true )

  return config.active
}

/**
 * Checks the passed in data to see if it should be filtered
 * @param {Object} config - Log Config for the currently running process
 * @param {string} data - Text to be printed if not filtered
 *
 * @returns {boolean} - True if the data should filtered / False if data should be printed
 */
const filterLog = (config, data) => {
  // Ensure filtering is active
  // If filtering is not active, then return true to filter OUT the data
  if(!checkActive(config, data)) return true

  // Check if the data is in the filters array
  return config.filters.reduce((inFilter, filter) => {
    return inFilter || data.trim().indexOf(filter) === 0
  }, false)
}

/**
 * Handler for logging data passed in from an event callback
 * @param {function} eventCb - Override for an event callback
 * @param {string} type - type or callback event for stdio
 * @param {Object} config - Log Config for the currently running process
 * @param {string} data - Text to be logged
 * @param {string} procId - Id of the process that's firing the event callback
 *
 * @returns {void}
 */
const handleLog = (eventCb, type, logConfig, data, procId) => {
  return !filterLog(logConfig, data)
    ? isFunc(eventCb)
      ? eventCb(data, procId)
      : process[type] && process[type].write(data)
    : null
}

/**
 * Builds event listeners that filter out logs based on passed in filters
 * @param {Object} config - Log Config for the currently running process
 *
 * @returns {Object} - Event listeners with filters
 */
const buildEvents = (config={}) => {
  const filter = get(config, 'filter')
  const onStdOut = get(config, 'onStdOut')
  const onStdErr = get(config, 'onStdErr')

  // If filter set to true, or there's no event callbacks, just return empty
  if(filter !== true && (!onStdOut && !onStdErr)) return {}

  // Merge the passed in logConfig with the default
  const logConfig = deepMerge(defLogConf, config.logConfig)

  // Create event handler callbacks
  return {
    onStdOut: (data, procId) => handleLog(onStdOut, 'stdout', logConfig, data, procId),
    onStdErr: (data, procId) => handleLog(onStdErr, 'stderr', logConfig, data, procId)
  }
}

/**
 * Executes an child process, with stdio set to pipe
 * @param {string} cmd - Command to be run
 * @param {Array} options - extra options to pass to the child process
 * @param {string} location - Where the command should be run
 *
 * @returns {*} - Response from async exec cmd
 */
const pipeCmd = (cmd, options={}, location=process.cwd()) => {
  // Pull the logConfig from the passed in options
  // This way we can pass all other options to the spawnCmd call
  const { logConfig={}, ...cmdOpts } = options

  const spawnOpts = {
    ...cmdOpts,
    // Build the event listeners to allow log filtering
    ...buildEvents(options),
    // Set the location where the command should be run
    cwd: options.cwd || location,
    // Ensure the stdio gets set to pipe
    options: { ...cmdOpts.options, stdio: 'pipe' }
  }

  // Execute the command, and return the response
  return spawnCmd(cmd, spawnOpts)

}


module.exports = {
  pipeCmd,
}