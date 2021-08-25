const { Logger } = require('KegLog')
const { throwTaskFailed } = require('./throwTaskFailed')
const { GLOBAL_CONFIG_TAP_PROXY } = require('KegConst/constants')
const { getSetting } = require('KegUtils/globalConfig/getSetting')
const { getGlobalConfig } = require('KegUtils/globalConfig/getGlobalConfig')

const throwMissingTapProxy = () => {
  const globalConfig = getGlobalConfig()
  const tapName = getSetting(GLOBAL_CONFIG_TAP_PROXY)
  tapName
    ? Logger.error(`Acting tap-proxy ${tapName} does not exists as a linked tap.`)
    : Logger.error(`Could not find tap linked as a proxy.`)
  
  Logger.pair(
    `Ensure the value at path`,
    `<globalConfig>.cli.settings.${GLOBAL_CONFIG_TAP_PROXY}`,
    `is the the name of a linked tap`
  )

  throwTaskFailed()
}

module.exports = {
  throwMissingTapProxy
}