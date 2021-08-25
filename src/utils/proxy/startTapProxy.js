const { noOp } = require('@keg-hub/jsutils')
const { DOCKER } = require('KegConst/docker')
const { composeService } = require('KegUtils/services/composeService')
const { mergeTaskOptions } = require('KegUtils/task/options/mergeTaskOptions')
const { injectService } = require('KegUtils/services/injectService')


/**
 * Starts the tap proxy registered to globalConfig.cli.settings.tapAsProxy
 */
const startTapProxy = async (args, tapObj) => {
  const { globalConfig, tasks, params } = args
  
  const injectResp = await injectService({
    app: tapObj.name,
    injectPath: tapObj.path,
    taskData: {
      task: {
        name: 'start',
        action: noOp,
        inject: true,
        options: {},
        parent: 'proxy',
        locationContext: 'REPO',
      },
      params: {
        build: false,
        cache: true,
        destroy: true,
        satisfy: true,
        follow: true,
        install: false,
        log: false,
        recreate: false,
        pull: false,
        follow: false,
        sync: [],
        service: 'mutagen',
        env: params.env,
      }
    }
  })

  return composeService({
    tasks,
    globalConfig,
    command: tapObj.name,
    options: [],
    __internal: {
      ...args.__internal,
      skipDockerExec: true,
      skipDockerSyncs: true,
      locationContext: 'REPO',
    },
    ...injectResp,
  })
}

module.exports = {
  startTapProxy
}