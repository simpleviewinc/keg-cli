const { get, isUrl, noOpObj } = require('@keg-hub/jsutils')
const { CLI_CONFIG_GIT } = require('../constants/constants')
const { getKegGlobalConfig } = require('@keg-hub/cli-utils')

/**
 * Builds the git url to clone the repo
 * If the name is a url, then uses that, otherwise name is joined of the the org url
 * @param {string} orgUrl - Organization url of a git repository
 * @param {string} name - Name of the git repo || full git repository url
 * @param {string} branch - Branch of the repo to clone (defaults to master)
 *
 * @returns {string} - Built git repo url
 */
const buildGitUrl = (orgUrl, name, branch) => {
  return isUrl(name)
    ? `${ name }${ branch }`
    : `${ orgUrl }/${ name }.git${ branch }`
}

/**
 * Gets the git url for a repo from the globalConfig object
 * @param {Object} [globalConfig=] - Global config object for the Keg CLI
 * @param {string} key - Key name of the path to get
 * @param {string} branch - Branch of the repo to clone (defaults to master)
 *
 * @returns {string} - Found repo url
 */
const configUrl = ({ globalConfig, repo, branch }) => {
  const { orgUrl, repos=noOpObj } = get(
    globalConfig || getKegGlobalConfig(),
    CLI_CONFIG_GIT,
    noOpObj
  )

  return orgUrl &&
    repos[repo] &&
    buildGitUrl(orgUrl, repos[repo], branch ? `#${branch}` : '')
}

module.exports = {
  configUrl
}