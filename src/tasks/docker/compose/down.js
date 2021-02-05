const { Logger } = require('KegLog')
const { spawnCmd } = require('KegProc')
const { throwComposeFailed } = require('KegUtils/error/throwComposeFailed')
const { buildComposeCmd } = require('KegUtils/docker/compose/buildComposeCmd')
const { removeInjected } = require('KegUtils/docker/compose/removeInjectedCompose')
const { buildContainerContext } = require('KegUtils/builders/buildContainerContext')

/**
 * Runs the docker-compose down command for the passed in context
 * @function
 * @param {Object} args - arguments passed from the runTask method
 * @param {Object} args.globalConfig - Global config object for the keg-cli
 *
 * @returns {void}
 */
const composeDown = async args => {
  const { globalConfig, __internal, params } = args
  const { log } = params

  // Get the context data for the command to be run
  const containerContext = await buildContainerContext(args)
  const { location, cmdContext, tap, contextEnvs } = containerContext

  // Build the docker compose down command
  const { dockerCmd } = await buildComposeCmd({
    params,
    cmdContext,
    contextEnvs,
    cmd: 'down',
    globalConfig,
  })

  // Run the docker compose down command
  const cmdFailed = await spawnCmd(
    dockerCmd,
    { options: { env: contextEnvs }},
    location,
    !Boolean(__internal),
  )

  // Returns 0 if the command is successful, which is falsy
  // So check for truthy value, which means the command failed
  cmdFailed && throwComposeFailed(dockerCmd, location)

  // Attempt to remove the injected compose file after stopping the service
  await removeInjected(tap || cmdContext, globalConfig)

  log && Logger.highlight(`Compose service`, `"${ cmdContext }"`, `destroyed!`)

  return containerContext

}

module.exports = {
  down: {
    name: 'down',
    alias: [ 'kill' ],
    action: composeDown,
    description: `Run docker-compose down command`,
    example: 'keg docker compose down <options>',
    options: {
      context: {
        description: 'Context of docker compose down command (tap | core | components)',
        example: 'keg docker compose down --context core',
        required: true
      },
      log: {
        description: 'Log the compose command to the terminal',
        example: 'keg docker compose down --log false',
        default: true,
      },
      tap: {
        description: 'Name of the tap to down. Required when "context" is "tap"',
        example: 'keg docker compose down --context tap --tap events-force',
      },
      remove: {
        alias: [ 'rm' ],
        allowed: [ 'images', 'volumes', 'all', 'orphans' ],
        description: 'Remove collateral docker items while bringing the docker-compose service down',
        example: 'keg docker compose down --remove images,volumes'
      },
    }
  }
}
