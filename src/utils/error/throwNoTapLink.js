const { Logger } = require('KegLog')
const { get, mapObj } = require('@keg-hub/jsutils')
const { constants: { GLOBAL_CONFIG_PATHS } } = require('KegRepos/cli-utils')
const { throwTaskFailed } = require('./throwTaskFailed')

/*
 * Helper to log an error message when a tap link can not be found in the global config
 * @function
 * @param {Object} globalConfig - Global config object for the keg-cli
 * @param {string} tapName - Name of the tap that is not linked
 *
 * @returns {void}
*/
const throwNoTapLink = (globalConfig, tapName) => {

  Logger.error(`\n Linked path for tap '${tapName}' does not exist in the Global config!`)

  Logger.empty()

  const linkPaths = {}
  mapObj(get(globalConfig, `${ GLOBAL_CONFIG_PATHS.TAP_LINKS }`, {}), (alias, tapConfig) => {
    linkPaths[alias] = tapConfig.path
  })

  Logger.cyan(`Global Config Linked Tap Paths:`)
  Logger.data(linkPaths)

  Logger.empty()

  throwTaskFailed()

}

module.exports = {
  throwNoTapLink
}