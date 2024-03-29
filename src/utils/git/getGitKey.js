const { get } = require('@keg-hub/jsutils')
const { ask } = require('KegRepos/ask-it')
const { decrypt } = require('KegCrypto')
const { throwWrongPassword } = require('../error/throwWrongPassword')
const { getSetting } = require('../globalConfig/getSetting')
const { constants: { GLOBAL_CONFIG_PATHS } } = require('KegRepos/cli-utils')

/**
 * Gets the git key to allow cloning private repos
 * Pulls from the ENV GIT_KEY or global config
 * @param {Object} globalConfig - Global config object for the Keg CLI
 *
 * @returns {string} - Found git key
 */
const getGitKey = async globalConfig => {
  if(process.env.GIT_KEY) return process.env.GIT_KEY

  const password = getSetting(`git.secure`)
    ? await ask.password('Please enter your password')
    : false

  try {
    return decrypt(get(globalConfig, `${GLOBAL_CONFIG_PATHS.GIT}.key`), password)
  }
  catch(e){
    throwWrongPassword()
  }
}

module.exports = {
  getGitKey
}
