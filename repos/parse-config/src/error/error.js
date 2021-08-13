/*
 * Builds an error message based on passed in array
 * @function
 * @throws
 * @param {Array<string>} messages - Groups of strings to be logged as the error
 *
 * @returns {String} - Joined messages as a single string
 */
const buildMessage = messages => {
  return `\n ${messages.join('\n ')}\n`
}

/*
 * Helper to throw a file not found error
 * @function
 * @throws
 * @param {string} filePath - Path to the file that could not be found
 * @param {string} extra - Extra error message to add to the default
 * @param {boolean} exit - Should the process exit after the error is logged
 *
 * @returns {void}
 */
const throwNoFile = (filePath, extra, exit) => {
  const defMessage = [`File path does not exist at ${filePath}.`]
  const message = extra ? defMessage.concat([extra]) : defMessage

  exit ? exitError(...message) : throwError(...message)
}

/*
 * General error handler
 * @function
 * @throws
 * @param {Array<string>} message - Strings to be logged as the error
 *
 * @returns {void}
 */
const throwError = (...message) => {
  throw new Error(buildMessage(message))
}

/*
 * Logs an error to the console, then exits the current process
 * @function
 * @param {Array<string>} message - v to be logged as the error
 *
 * @returns {void}
 */
const exitError = (...message) => {
  console.error(buildMessage(message))
  process.exit(1)
}

module.exports = {
  exitError,
  throwError,
  throwNoFile,
}
