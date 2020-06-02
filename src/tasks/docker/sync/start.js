
const docker = require('KegDocCli')
const { Logger } = require('KegLog')
const { spawnCmd } = require('KegProc')
const { DOCKER } = require('KegConst/docker')
const { get, checkCall } = require('jsutils')
const { logVirtualIP } = require('KegUtils/log')
const { buildLocationContext } = require('KegUtils/builders')
const { runInternalTask } = require('KegUtils/task/runInternalTask')

/**
 * Checks if the base image exists, and it not builds it
 * @function
 *
 * @returns {void}
 */
const checkBaseImage = async args => {
  const baseName = get(DOCKER, `CONTAINERS.BASE.ENV.IMAGE`)
  const exists = await docker.image.exists(baseName)
  if(exists) return

  Logger.info(`Keg base image does not exist, building now...`)
  Logger.empty()
  
  return runInternalTask(`tasks.docker.tasks.build`, {
    ...args,
    task: buildTask,
    params: { ...args.params, context: 'base' },
  })

  const buildTask = get(args, `tasks.docker.tasks.build`)
  return checkCall(buildTask.action, {
    ...args,
    task: buildTask,
    params: { context: 'base' },
  })

}

/**
 * Removes the current running container based on the context
 * @function
 * @param {string} context - Context of the docker container for the current task
 *
 * @returns {void}
 */
const removeCurrent = async context => {
  // Remove the container based on the context
  Logger.info(`Removing docker container "${context}"...`)
  Logger.empty()

  const containerName = get(DOCKER, `CONTAINERS.${context.toUpperCase()}.ENV.CONTAINER_NAME`)
  
  containerName && await docker.container.remove(containerName, false)

}

/**
 * Removes the current running container based on the context
 * @function
 * @param {string} context - Context of the docker container for the current task
 * @param {Object} contextEnvs - Group envs for the current context
 * @param {string} location - Local repo location of of the context
 *
 * @returns {void}
 */
const checkSyncClean = async (context, contextEnvs, location) => {
  // Then run the sync clean command
  Logger.info(`Cleaning docker-sync container...`)
  Logger.empty()

  await spawnCmd(`docker-sync clean`, { options: { env: contextEnvs }}, location)
}

/**
 * Starts docker-sync for the passed in context
 * @function
 * @param {Object} params - Formatted arguments passed to the current task
 *
 * @returns {void}
 */
const buildExtraEnvs = ({ env, command, install }) => {
  const extraENVs = { ENV: env, NODE_ENV: env }
  command && ( extraENVs.EXEC_CMD = command )
  install && ( extraENVs.NM_INSTALL = true )
  
  return extraENVs
}

/**
 * Starts docker-sync for the passed in context
 * @function
 * @param {Object} args - arguments passed from the runTask method
 * @param {Object} args.globalConfig - Global config object for the keg-cli
 *
 * @returns {void}
 */
const startDockerSync = async args => {

  const { globalConfig, params, options, task, tasks } = args
  const { build, clean, context, detached, tap } = params

  // Get the context data for the command to be run
  const { cmdContext, contextEnvs, location } = await buildLocationContext({
    globalConfig,
    task,
    params,
    envs: buildExtraEnvs(params)
  })

  // Check if the base image exists, and if not then build it
  await checkBaseImage(args)

  // Check if we should rebuild the container
  if(build || clean) await removeCurrent(cmdContext)

  // Check if docker-sync should be cleaned first
  if(clean) await checkSyncClean(cmdContext, contextEnvs, location)

  // Check if sync should run in detached mode 
  // TODO: find way to validate if docker-sync is already running
  // That way we can either kill it, or just run docker-compare up
  const dockerCmd = `${ Boolean(detached) ? 'docker-sync' : 'docker-sync-stack' } start`

  // Log the ip address so we know how to hit it in the browser
  await logVirtualIP()

  // Run docker-sync
  await spawnCmd(dockerCmd, { options: { env: contextEnvs }}, location)

}

module.exports = {
  name: 'start',
  alias: [ 'st' ],
  action: startDockerSync,
  description: `Starts the docker-sync`,
  example: 'keg docker sync start',
  options: {
    context: {
      allowed: DOCKER.IMAGES,
      description: 'Context of docker compose up command (components || core || tap)',
      example: 'keg docker sync start --context core',
      default: 'core'
    },
    build: {
      description: 'Rebuilds the docker container for the passed in context!',
      default: false
    },
    clean: {
      description: 'Cleans docker-sync before running the docker-sync command',
      example: 'keg docker sync start --clean false',
      default: false
    },
    command: {
      alias: [ 'cmd' ],
      description: 'The command to run within the docker container. Overwrites the default (yarn web)',
      example: 'keg docker sync start --command ios',
      default: 'web'
    },
    detached: {
      description: 'Runs the docker-sync process in the background',
      default: false
    },
    env: {
      description: 'Environment to start the Docker containers in',
      example: 'keg docker sync start --env=staging ...',
      default: 'development',
    },
    install: {
      alias: [ 'in' ],
      description: 'Install node_modules ( yarn install ) in the container before starting the app',
      example: 'keg docker sync start --install ...',
      default: false
    },
    tap: {
      description: 'Name of the linked tap to run. Overrides the context option!',
      example: 'keg docker sync start --tap name-of-tap',
      default: false
    }
  }
}