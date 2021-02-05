const { Logger } = require('KegLog')
const { spawnCmd } = require('KegProc')
const { DOCKER } = require('KegConst/docker')
const { pickKeys } = require('@keg-hub/jsutils')
const { logVirtualUrl } = require('KegUtils/log')
const { buildContainerContext } = require('KegUtils/builders')
const { throwComposeFailed } = require('KegUtils/error/throwComposeFailed')
const { buildComposeCmd } = require('KegUtils/docker/compose/buildComposeCmd')
const { mergeTaskOptions } = require('KegUtils/task/options/mergeTaskOptions')

/**
 * Runs docker-compose up command for (components | core | tap)
 * @function
 * @param {Object} args - arguments passed from the runTask method
 * @param {Object} args.globalConfig - Global config object for the keg-cli
 *
 * @returns {void}
 */
const composeRestart = async args => {
  const { globalConfig, __internal, params, task } = args
  const { context, log } = params

  // Get the context data for the command to be run
  const containerContext = await buildContainerContext({
    globalConfig,
    task,
    params,
    __internal,
  })
  const { location, cmdContext, contextEnvs, tap, image } = containerContext

  // Build the docker compose command
  const { dockerCmd, composeData } = await buildComposeCmd({
    params,
    cmdContext,
    contextEnvs,
    globalConfig,
    cmd: 'restart',
  })

  Logger.empty()

  // Run the docker-compose restart command
  const cmdFailed = await spawnCmd(
    dockerCmd,
    { options: { env: contextEnvs }},
    location,
    !Boolean(__internal),
  )

  // Returns 0 if the command is successful, which is falsy
  // So check for truthy value, which means the command failed
  cmdFailed && throwComposeFailed(dockerCmd, location)

  log && Logger.highlight(`Restarted`, `"${ cmdContext }"`, `compose environment!`)

  // Log the virtual url so users know how to access the running containers
  logVirtualUrl(composeData, contextEnvs.KEG_PROXY_HOST)

  // Return the built context info, so it can be reused if needed
  return containerContext

}

module.exports = {
  restart: {
    name: 'restart',
    alias: [ 'rest', 'rerun', 'rr', 'rst' ],
    action: composeRestart,
    description: `Run docker-compose up command`,
    example: 'keg docker compose up <options>',
    options: pickKeys(
      mergeTaskOptions('docker compose', 'restart', 'startService', {
        context: {
          allowed: DOCKER.IMAGES,
          description: 'Context of docker compose up command (components || core || tap)',
          example: 'keg docker compose restart --context core',
          required: true
        }
      }),
      [
        'context',
        'docker',
        'install',
        'log',
      ]
    )
  }
}
