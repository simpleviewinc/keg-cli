const { Logger } = require('KegLog')
const { Loading } = require('./loading')
const { spawnCmd } = require('KegRepos/spawn-cmd')
const {
  get,
  checkCall,
  deepMerge,
  isFunc,
  isArr,
  noOpObj
} = require('@keg-hub/jsutils')


/**
 * Checks the passed in data to see if it should be filtered
 * @param {Object} logs - Log Config for the currently running process
 * @param {string} data - Text to be printed if not filtered
 *
 * @returns {boolean} - True if the data should filtered / False if data should be printed
 */
const filterAllowedLogs = (filters, data) => {
  // Check if the data is in the filters array
  const isFiltered = filters.reduce((inFilter, filter) => {
    return inFilter || data.trim().indexOf(filter) === 0
  }, false)
  
  return isFiltered
  
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
const handleLog = (eventCb, type, loading=noOpObj, logs=noOpObj, data, procId) => {
  try {

    const activeLoading = loading && loading.active
    // Check for filtered logs, which are allowed to log
    // Even though loading is active
    const allowLog = logs.allow && filterAllowedLogs(logs.allow, data)
    const shouldFilter = activeLoading || !allowLog

    // If loading is active, update the loading progress
    activeLoading && loading.progress(shouldFilter && 1, data)

    // Call the callback for the event to allow data capture
    isFunc(eventCb) && eventCb(data, procId)

    // Check if the data should be logged
    ;(!loading || !loading.active) &&
      !shouldFilter &&
      process[type] &&
      process[type].write(data)

  }
  catch(err){
    // This should be a cli dev only error
    // Most user should not see this displayed
    // This throws when there is an error in the event handling code
    // NOT when there is an error in the pipeCmd Process
    Logger.error(err.message)
  }
}

/**
 * Handles when the piped process exits
 * <br/> Stops the loader and calls the passed in onExit method
 * @param {Object} config - Log Config for the currently running process
 * @param {Object} loading - Instance of the Loading class
 *
 * @returns {Object} - Event listener for onExit
 */
const handleExit = (config, loading) => {
  return (...args) => {
    loading && isFunc(loading.loader.stop) && loading.loader.stop()
    return checkCall(config.onExit, ...args)
  }
}

/**
 * Builds event listeners that filter out logs based on passed in filters
 * @param {Object} config - Config for the currently running process
 * @param {Object} logs - Log Config for the currently running process
 * @param {Object} loading - Loading Config for the currently running process
 *
 * @returns {Object} - Event listeners with filters
 */
const buildEvents = (config=noOpObj, logs=noOpObj, loading) => {
  const allow = get(logs, 'allow')
  const onStdOut = get(config, 'onStdOut')
  const onStdErr = get(config, 'onStdErr')

  // If allow set to true, or there's no event callbacks, just return empty
  // Because all logs are allowed, so no need to overwrite the process output callbacks
  if(allow !== true && (!onStdOut && !onStdErr)) return noOpObj

  const loadingConf = loading && new Loading({}, loading)

  // Create event handler callbacks
  return {
    onStdOut: (...args) => handleLog(onStdOut, 'stdout', loadingConf, logs, ...args),
    onStdErr: (...args) => handleLog(onStdErr, 'stderr', loadingConf, logs, ...args),
    onExit: handleExit(config, loadingConf)
  }
}

/**
 * Executes an child process, with stdio set to pipe
 * @param {string} cmd - Command to be run
 * @param {Object} options - extra options to pass to the child process
 * @param {string} location - Where the command should be run
 *
 * @returns {*} - Response from async exec cmd
 */
const pipeCmd = (cmd, options={}, location=process.cwd()) => {
  // Pull the logConfig from the passed in options
  // This way we can pass all other options to the spawnCmd call
  const { logs=noOpObj, loading, ...cmdOpts } = options

  const spawnOpts = {
    ...cmdOpts,
    // Build the event listeners to allow log filtering
    ...buildEvents(options, logs, loading),
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