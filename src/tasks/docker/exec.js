const docker = require('KegDocCli')
const { Logger } = require('KegLog')
const { findContainer } = require('KegUtils/docker/findContainer')
const { containerSelect } = require('KegUtils/docker/containerSelect')
const { KEG_DOCKER_EXEC, KEG_EXEC_OPTS } = require('KegConst/constants')
const { throwRequired, throwContainerNotFound } = require('KegUtils/error')
const { buildContainerContext } = require('KegUtils/builders/buildContainerContext')

/**
 * Execute a docker command on a running container
 * @function
 * @param {Object} args - arguments passed from the runTask method
 * @param {string} args.command - Initial command being run
 * @param {Array} args.options - arguments passed from the command line
 *
 * @returns {void}
 */
const dockerExec = async args => {
  const { params, task, __internal={} } = args
  const { cmd, detach, name, options, workdir, context, prefix:prefixType } = params

  // Ensure we have a content to build the container
  !context && throwRequired(task, 'context', task.options.context)

  // Get the context data for the command to be run
  const execContext = await buildContainerContext({
    ...args,
    task,
    __internal,
    params: { ...params, context }
  })

  // TODO: find better way to get container name from tap alias || internal apps
  const { contextEnvs, location, prefix, image, container, id:containerId } = execContext

  // Get the name of the container to run the docker exec cmd on
  const containerName = containerId || container && container.name || image
  const containerRef = await findContainer(context, containerName, prefixType, name)

  !containerRef && throwContainerNotFound(containerName)

  const execArgs = { cmd, container: containerRef.id, opts: options, location }
  workdir && (execArgs.workdir = workdir)
  detach && (execArgs.detach = detach)

  Logger.empty()
  Logger.pair(`Running docker exec on container`, containerRef.name)
  Logger.empty()

  // Run the exec command on the container
  await docker.container
    .exec(execArgs, { options: { env: {
      // Add the default KEG_DOCKER_EXEC ENV
      [KEG_DOCKER_EXEC]: KEG_EXEC_OPTS.dockerExec,
      // contextEnvs should already have the KEG_DOCKER_EXEC set to override it if needed
      ...contextEnvs
    }}})

  return execContext

}

module.exports = {
  exec: {
    name: 'exec',
    alias: [ 'ex', 'attach', 'att' ],
    action: dockerExec,
    description: 'Execute a command on a running docker container',
    example: 'keg docker exec <options>',
    options: {
      context: {
        description: 'Context or name of the container to run the command on',
        example: 'keg docker exec --context core',
        enforced: true,
      },
      cmd: {
        alias: [ 'entry', 'command' ],
        description: 'Docker container command to run. Default ( /bin/bash )',
        example: 'keg docker exec --cmd "ls"',
        default: '/bin/bash'
      },
      workdir: {
        alias: [  'location', 'loc', 'dir', 'd' ],
        description: 'Directory in the docker container where the command should be run',
        example: 'keg docker exec --workdir /app',
      },
      detach: {
        alias: [ 'detached' ],
        description: 'Run the docker exec task in detached mode',
        example: 'keg docker exec --detach',
        default: false,
      },
      privileged: {
        alias: [ 'priv', 'pri' ],
        description: 'Run the docker exec task in privileged mode',
        example: 'keg docker exec --no-privileged',
        default: true,
      },
      options: {
        alias: [ 'opts' ],
        description: 'Extra docker exec command options',
        default: '-it'
      },
      tap: {
        description: 'Tap name when "context" options is set to "tap"',
        example: 'keg docker exec --context tap --tap my-tap',
      },
      prefix: {
        alias: [ 'type' ],
        allowed: [ 'package', 'img' ],
        description: 'The container prefix type. For accessing containers with added prefixes',
        example: 'keg docker exec --context tap --tap my-tap --prefix package',
      },
      name: {
        alias: ['branch'],
        description: 'Partial name of the container to help filter the found containers',
        example: 'keg docker exec --context tap --tap my-tap --prefix package --name feature-branch',
      }
    }
  }
}
