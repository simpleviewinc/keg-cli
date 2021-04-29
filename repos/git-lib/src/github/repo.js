const { ghCli } = require('./commands')
const { injectGlobalConfig } = require('./helpers')
const { configUrl } = require('../utils/configUrl')

/**
 * Clones a repo based on the passed in arguments
 * @function
 * @param {Object} globalConfig - Keg-Cli globalConfig object
 *
 * @returns {*} - response of the github cli
 */
const clone = injectGlobalConfig((getGlobalConfig, args) => {
  const { repo, owner, cloneTo } = args
  const repoUrl = configUrl({ globalConfig, repo })
  
})

/**
 * Creates a git repo tied to github based on the passed in args
 * @function
 * @param {Object} globalConfig - Keg-Cli globalConfig object
 *
  * @returns {*} - response of the github cli
 */
const create = injectGlobalConfig((getGlobalConfig, args) => {
  const { repo, owner } = args
  const repoUrl = configUrl({ globalConfig, repo })
  
})

/**
 * Forks a repo based on the passed in args
 * @function
 * @param {Object} globalConfig - Keg-Cli globalConfig object
 *
  * @returns {*} - response of the github cli
 */
const fork = injectGlobalConfig((getGlobalConfig, args) => {
  const { repo, owner } = args
  const repoUrl = configUrl({ globalConfig, repo })
  
})

/**
 * Prints the Readme for the passed in repo
 * @function
 * @param {Object} globalConfig - Keg-Cli globalConfig object
 *
  * @returns {*} - response of the github cli
 */
const view = injectGlobalConfig((getGlobalConfig, args) => {
  const { repo, owner } = args
  const repoUrl = configUrl({ globalConfig, repo })
  
})


module.exports = {
  clone,
  create,
  fork,
  view,
}