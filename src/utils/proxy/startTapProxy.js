const { DOCKER } = require('KegConst/docker')
const { composeService } = require('KegUtils/services/composeService')
const { mergeTaskOptions } = require('KegUtils/task/options/mergeTaskOptions')
const { checkContainerPaths } = require('KegUtils/services/injectService')

/**
 * Starts the tap proxy registered to globalConfig.cli.settings.tapAsProxy
 */
const startTapProxy = async (args, tapObj) => {
  const tapPaths = await checkContainerPaths(tapObj.name, tapObj.path)

  // TODO: {TAP-PROXY} - need to add params from startServiceOptions
  // But the need to match the params that was used in the proxy start task previously
  // OR load the tap start task for the tap-proxy, then use runInternalTask to call it
  // This would more closly match how tap tasks are called

  return true

  return composeService({
    ...args,
    params: {
      ...args.params,
      tap: tapObj.name,
      context: tapObj.name,
    },
    __internal: {
      ...args.__internal,
      skipDockerExec: true,
      skipDockerSyncs: true,
      locationContext: args.task.locationContext,
    },
  },
  {
    context: tapObj.name,
    pull: false,
    follow: false,
    service: tapPaths.serviceName,
    container: tapPaths.serviceName,
  })
}

module.exports = {
  startTapProxy
}