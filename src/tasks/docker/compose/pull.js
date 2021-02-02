const { Logger } = require('KegLog')
const { spawnCmd } = require('KegProc')
const { DOCKER } = require('KegConst/docker')
const { pickKeys } = require('@keg-hub/jsutils')
const { logVirtualUrl } = require('KegUtils/log')
const { runInternalTask } = require('KegUtils/task/runInternalTask')
const { throwComposeFailed } = require('KegUtils/error/throwComposeFailed')
const { mergeTaskOptions } = require('KegUtils/task/options/mergeTaskOptions')
const { buildComposeCmd } = require('KegUtils/docker/compose/buildComposeCmd')
const { buildContainerContext } = require('KegUtils/builders')

/**
 * Runs docker-compose pull command
 * @function
 * @param {Object} args - arguments passed from the runTask method
 * @param {Object} args.globalConfig - Global config object for the keg-cli
 *
 * @returns {void}
 */
const composePull = async args => {
  const { envs, globalConfig, __internal, params, task } = args
  const { log } = params

  // Get the context data for the command to be run
  const containerContext = await buildContainerContext(args)
  const { location, cmdContext, contextEnvs, tap, image } = containerContext


  // Build the docker compose command
  const { dockerCmd, composeData } = await buildComposeCmd({
    cmd: 'pull',
    cmdContext,
    contextEnvs,
    globalConfig,
    // Default no-recreate to true, if recreate is falsy
    params: params,
  })

  console.log(`---------- dockerCmd ----------`)
  console.log(dockerCmd)
  console.log(`---------- composeData ----------`)
  console.log(composeData)
  process.exit()

  // TODO: add service name to docker cmd
  // Fix from options, currently not overwriting KEG_IMAGE_FROM env like it should

  // Run the docker-compose up command
  // const cmdFailed = await spawnCmd(
  //   dockerCmd,
  //   { options: { env: contextEnvs }},
  //   location,
  //   !Boolean(__internal),
  // )

  // Returns 0 if the command is successful, which is falsy
  // So check for truthy value, which means the command failed
  // cmdFailed && throwComposeFailed(dockerCmd, location)

  // log && Logger.highlight(`Finished pulling`, `"${ cmdContext }"`, ` from provider!`)

  // Return the built context info, so it can be reused if needed
  return containerContext

}

module.exports = {
  pull: {
    name: 'pull',
    alias: [ 'pl' ],
    action: composePull,
    description: `Run docker-compose pull command`,
    example: 'keg docker compose pull <options>',
    options: mergeTaskOptions(`keg docker compose`, `pull`, `pull`),
  }
}