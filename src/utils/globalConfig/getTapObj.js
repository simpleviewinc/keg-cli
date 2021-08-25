const { get, isObj } = require('@keg-hub/jsutils')
const { GLOBAL_CONFIG_TAP_PROXY } = require('KegConst/constants')
const { getSetting } = require('KegUtils/globalConfig/getSetting')
const { checkContainerPaths } = require('KegUtils/services/injectService')
const { constants: { GLOBAL_CONFIG_PATHS } } = require('KegRepos/cli-utils')
const { throwMissingTapProxy } = require('KegUtils/error/throwMissingTapProxy')

const { TAP_LINKS } = GLOBAL_CONFIG_PATHS

/**
 * Pulls the globalConfig.cli.settings.tapAsProxy value
 * To get the name of the tap that is acts as the proxy
 * Uses that to get the image / service name of that tap form it's docker-compose config / ENVs
 */
const getTapObj  = async ({ globalConfig }) => {
  const tapName = getSetting(GLOBAL_CONFIG_TAP_PROXY)
  const tapObj = get(globalConfig, `${ TAP_LINKS }.${ tapName }`)

  return !isObj(tapObj)
    ? throwMissingTapProxy()
    : { ...tapObj, name: tapName }
}

module.exports = {
  getTapObj
}