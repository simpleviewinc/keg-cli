const { Logger } = require('KegLog')
const { getServiceArgs } = require('./getServiceArgs')
const { runInternalTask } = require('KegUtils/task/runInternalTask')
const { checkEnvConstantValue } = require('KegUtils/helpers/checkEnvConstantValue')

/**
 * Stops a running docker-compose service
 * @param {Object} args - Default arguments passed to all tasks
 * @param {Object} argsExt - Extra args to override the default args
 *
 * @returns {void}
 */
const stopService = async (args, argsExt) => {
  Logger.empty()

  // Build the service arguments
  const serviceArgs = getServiceArgs(args, argsExt)

  // Call the docker-compose stop task
  const containerContext = await runInternalTask('docker.tasks.compose.tasks.stop', serviceArgs)

  // Check envs for creating the mutagen auto-sync
  // If auto-sync is turned on, try to terminate it
  // If KEG_AUTO_SYNC is set to false then don't call mutagen terminate
  // If it's true or not defined, then kill the mutagen sync
  !checkEnvConstantValue(cmdContext, 'KEG_AUTO_SYNC', false) &&
    await runInternalTask('mutagen.tasks.terminate', serviceArgs)

  Logger.highlight(
    `Stopped`,
    `"${ serviceArgs.params.tap || serviceArgs.params.context }"`,
    `compose environment!`
  )
  Logger.empty()

}

module.exports = {
  stopService
}