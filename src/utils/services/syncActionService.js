const { Logger } = require('KegLog')
const { getServiceArgs } = require('./getServiceArgs')
const { generalError } = require('../error/generalError')
const { getRemotePath } = require('../getters/getRemotePath')
const { runInternalTask } = require('../task/runInternalTask')
const { get, isArr, isStr, isBool } = require('@ltipton/jsutils')
const { findDependencyName } = require('../helpers/findDependencyName')
const { getMutagenConfig } = require('KegUtils/getters/getMutagenConfig')
const { buildContainerContext } = require('../builders/buildContainerContext')

/**
 * Normalizes the sync arguments to pass to the sync action
 * @param {Object} serviceArgs - arguments passed from the runTask method
 *
 * @returns {Array} - Array of Promises of each sync action
 */
const normalizeSyncData = serviceArgs => {
  const { params, mutagen={} } = serviceArgs
  const { env, force, dependency, context, ...syncParams } = params

  const syncData = { ...syncParams, ...mutagen }
  if(!syncData.remote && !syncData.remotePath) return {}

  const remotePath = syncData.remote.includes('/')
    ? syncData.remote
    : remotePath || getRemotePath(context, dependency, remote)

  const dependencyName = findDependencyName(dependency, remotePath)
  return { ...syncData, remotePath, dependencyName }
}

/**
 * Runs the sync actions defined in the mutagen.yml sync config
 * Runs each action in series, one after the other
 * @param {Boolean} serviceArgs.detach - Should the action run in detached mode
 * @param {Object} action - Sync action to run
 *
 * @returns {Array} - Array of Promises of each sync action
 */
const getExecParams = ({ detach }, action) => {
  const { workdir, location, ...actionParams } = action
  const detachMode = isBool(detach) ? detach : actionParams.detach

  return {
    ...actionParams,
    detach: detachMode,
    workdir: workdir || location,
  }

}

/**
 * Runs the sync actions defined in the mutagen.yml sync config
 * Runs each action in series, one after the other
 * @param {Object} serviceArgs - arguments passed from the runTask method
 * @param {string} cmdContext - Context of the container to sync with
 * @param {Array} actions - Actions to run in the container for the sync
 *
 * @returns {Array} - Array of Promises of each sync action
 */
const runSyncActions = (serviceArgs, cmdContext, actions) => {
  return Promise.all(
    actions.map(async action => {

      // Get the cmd || cmds to run
      const { cmds, cmd, ...actionParams } = action

      // Normalize the cmds array
      const allCmds = isArr(cmds) ? cmds : isStr(cmds) ? [ cmds ] : []
      
      // If single cmd is defined add it to the cmds array
      if(isStr(cmd)) allCmds.push(cmd)

      // Loop the cmds and run the docker exec task on each on
      // Reuse the actionParams to ensure they get passed to each exec task call
      const runCmds = await Promise.all(
        await allCmds.reduce(async (toResolve, cmd) => {
          const resolved = await toResolve

          Logger.highlight(`Running sync action:`, `${cmd}`)

          // Run the docker exec task for each cmd
          isStr(cmd) && resolved.push(
            await runInternalTask('tasks.docker.tasks.exec', {
              ...serviceArgs,
              params: {
                ...serviceArgs.params,
                context: cmdContext,
                ...getExecParams(
                  serviceArgs.params,
                  actionParams
                ),
                cmd,
              },
            })
          )

          return resolved
        }, Promise.resolve([]))
      )

      return runCmds
    })
  )
}

/**
 * Starts a mutagen sync between local and a docker container
 * @param {Object} args - arguments passed from the runTask method
 * @param {Object} args.globalConfig - Global config object for the keg-cli
 * @param {Object} args.params - Formatted object of the passed in options 
 * @param {string} params.container - Name of the container to run ( core / components / tap )
 * @param {string} params.tap - Name of tap, if container arg value is `tap`
 * @param {string} params.location - Location where the command should be run
 *
 * @returns {void}
 */
const syncActionService = async (args, argsExt) => {

  const serviceArgs = getServiceArgs(args, argsExt)
  const actionContext = await buildContainerContext(serviceArgs)
  const { cmdContext, context, id } = actionContext
  const { globalConfig, params } = serviceArgs

  // Get the actions for the sync
  const syncActions = await getMutagenConfig({
    __injected: params.__injected,
    context: cmdContext,
    configPath: 'actions'
  })

  if(!syncActions) return

  // Get the container, and the repo to be synced
  const { container, dependencyName } = normalizeSyncData(serviceArgs)

  // Get the actions to run based on the dependency
  const actions = syncActions[dependencyName]

  // If there's no container or actions, then just return
  if(!container || !isArr(actions) ) return serviceArgs

  // Run the actions for the dependency
  await runSyncActions(serviceArgs, cmdContext, actions)

  return actionContext
}

module.exports = {
  syncActionService
}