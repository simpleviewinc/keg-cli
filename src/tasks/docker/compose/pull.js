const docker = require('KegDocCli')
const { Logger } = require('KegLog')
const { isStr, noOpObj } = require('@keg-hub/jsutils')
const { throwComposeFailed } = require('KegUtils/error/throwComposeFailed')
const { mergeTaskOptions } = require('KegUtils/task/options/mergeTaskOptions')
const { buildComposeCmd } = require('KegUtils/docker/compose/buildComposeCmd')
const { checkPulledNewImage } = require('KegUtils/docker/checkPulledNewImage')
const { removeInjected } = require('KegUtils/docker/compose/removeInjectedCompose')
const { buildContainerContext } = require('KegUtils/builders/buildContainerContext')

/**
 * Runs docker-compose pull command
 * @function
 * @param {Object} args - arguments passed from the runTask method
 * @param {Object} args.globalConfig - Global config object for the keg-cli
 *
 * @returns {void}
 */
const composePull = async args => {
  const { globalConfig, __internal, params, task } = args

  // Get the context data for the command to be run
  const containerContext = await buildContainerContext(args)
  const { location, cmdContext, contextEnvs, tap, image } = containerContext

  await removeInjected(tap || cmdContext, globalConfig)

  // Build the docker compose command
  const {
    dockerCmd,
    composeData=noOpObj,
    imgNameContext=noOpObj,
  } = await buildComposeCmd({
    params,
    cmd: 'pull',
    __internal,
    cmdContext,
    contextEnvs,
    globalConfig,
  })

  Logger.empty()
  Logger.highlight(`Pulling docker image from`, imgNameContext.full)

  // Run the docker-compose pull command
  // Pipe the output, so we can capture if a new image has been pulled
  const { error, data, exitCode } = await docker.cliPipe(
    dockerCmd,
    {
      cwd: location,
      options: { env: contextEnvs },
      loading: {
        title: `- Downloading Image`,
        offMatch: [ `status:` ]
      },
    },
    { log: false },
  )

  // exitCode is 0 if the command is successful, which is falsy
  // So check for truthy value, which means the command failed
  exitCode && throwComposeFailed(dockerCmd, location, error)

  const isNewImage = checkPulledNewImage(data, error)

  Logger.empty()
  isNewImage
    ? Logger.highlight(`Pulled new image`, `${ imgNameContext.full }`, `from provider!`)
    : Logger.highlight(`Local image`, `${ imgNameContext.full }`, `is up to date!`)

  // Get the docker image object that was just pulled
  const imageRef = await docker.image.get(imgNameContext.full)

  // Return the state of the image being pulled
  return {
    imageRef,
    isNewImage,
    imgNameContext,
    containerContext,
  }

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