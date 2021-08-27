const path = require('path')
const { Logger } = require('KegLog')
const { GLOBAL_INJECT_FOLDER } = require('KegConst/constants')
const { getRepoPath } = require('KegUtils/getters/getRepoPath')
const { removeFile, pathExists } = require('KegFileSys')
const { getGlobalConfig } = require('KegUtils/globalConfig/getGlobalConfig')
const { domainFromBranch } = require('KegUtils/proxy/domainFromBranch')

/**
 * Removes an injected compose file from the global injected folder
 * <br/>Uses the passed in context and current git branch of the context's repo
 * @function
 * @param {string} injected - Context or name of the docker-compose service
 * @param {Object} globalConfig - Global config object for the keg-cli
 *
 * @returns {Void}
 */
const removeInjected = async (injected, globalConfig) => {
  // No injected exist for the proxy, so just return
  if(injected === 'proxy') return

  globalConfig = globalConfig || getGlobalConfig()
  const repoPath = getRepoPath(injected, globalConfig)
  const proxyDomain = repoPath && await domainFromBranch(injected, repoPath)

  proxyDomain && await removeInjectedCompose(proxyDomain, false)
}

/**
 * Removes an injected compose file from the global injected folder
 * @function
 * @param {string} injectedCompose - Path to the injected-compose.yml file
 *
 * @returns {Void}
 */
const removeInjectedCompose = async (name, log=true) => {
  try {
    const injectedCompose = path.join(GLOBAL_INJECT_FOLDER, `${name}.yml`)
    const [ err, exists ] = await pathExists(injectedCompose)
    if(err && log) Logger.error(err.stack || err)

    exists && await removeFile(injectedCompose)

    return true
  }
  catch(err){
    log && Logger.error(err.stack)
  }

}

module.exports = {
  removeInjected,
  removeInjectedCompose
}