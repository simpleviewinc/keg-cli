const { buildContainerContext } = require('KegUtils/builders/buildContainerContext')
const { throwRequired, generalError } = require('KegUtils/error')
const { logVirtualUrl } = require('KegUtils/log')
const { buildDockerCmd } = require('KegUtils/docker')
const { DOCKER } = require('KegConst/docker')
const docker = require('KegDocCli')

/**
 * Builds then executes a docker run command
 * @param {Object} args - arguments passed from the runTask method
 * @param {string} args.command - Initial command being run
 * @param {Array} args.options - arguments passed from the command line
 * @param {Object} args.tasks - All registered tasks of the CLI
 * @param {Object} globalConfig - Global config object for the keg-cli
 *
 * @returns {void}
 */
const dockerBuild = async args => {
  const { command, globalConfig, options, params, task, tasks } = args
  const { context } = params

  // Ensure we have a content to build the container
  !context && throwRequired(task, 'context', task.options.context)

  // Get the context data for the command to be run
  const { cmdContext, contextEnvs, location, tap } = await buildContainerContext({
    globalConfig,
    task,
    params,
  })

   // If using a tap, and no location is found, throw an error
  cmdContext === 'tap' && tap && !location && generalError(
    `Tap location could not be found for ${ tap }!`,
    `Please ensure the tap path is linked in the global config!`
  )

  // Build the docker run command with options
  const dockerCmd = buildDockerCmd(globalConfig, {
    ...params,
    cmd: `run`,
    options: options,
    envs: contextEnvs,
    location: location,
    context: cmdContext,
    ...(tap && { tap }),
  })

  // Log out the containers ip, so we know how to connect to it in the browser
  logVirtualUrl()

  // Run the container
  await docker.raw(dockerCmd, { options: { env: contextEnvs }}, location)

}

module.exports = {
  run: {
    name: 'run',
    alias: [ 'r' ],
    action: dockerBuild,
    description: `Runs docker build command for a container`,
    example: 'keg docker build <options>',
    location_context: DOCKER.LOCATION_CONTEXT.REPO,
    options: {
      context: {
        allowed: DOCKER.IMAGES,
        description: 'Name of the docker container to run',
        enforced: true,
      },
      entrypoint: {
        alias: [ 'entry', 'ep' ],
        description: 'Override the default entry point of the container',
      },
      env: {
        description: 'Environment to start the Docker container in',
        default: 'development',
      },
      docker: {
        description: `Extra docker arguments to pass to the 'docker run command'`
      },
      image: {
        description: `Name of the docker image to use. Defaults to context:latest`,
        example: 'keg docker run --image my-image:test',
      },
      install: {
        description: `Run yarn install before starting the application`,
        example: 'keg docker run --install'
      },
      mounts: {
        description: `List of key names or folder paths to mount into the docker container, separated by (,)`,
        example: 'keg docker run mounts=tap,cli,core'
      },
      tap: {
        description: 'Name of the tap to build. Required when "context" argument is "tap"',
      },
    },
  }
}
