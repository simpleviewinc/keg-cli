const { Logger } = require('KegLog')
const { get } = require('@keg-hub/jsutils')
const { constants: { GLOBAL_CONFIG_PATHS } } = require('KegRepos/cli-utils')
const { throwTaskFailed } = require('./throwTaskFailed')

/*
 * Helper to log an error message when a tap link location can not be found
 * @function
 * @param {Object} globalConfig - Global config object for the keg-cli
 * @param {string} tap - Name of the tap that is not linked
 *
 * @returns {void}
*/
const throwNoTapLoc = (globalConfig, tap) => {

  Logger.error(`Tap location could not be found for ${ tap }!`)
  Logger.highlight(`Ensure the linked tap path for`, `${ tap }`, `exists!`)

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
  throwNoTapLoc
}