const { get } = require('jsutils')
const { ask } = require('KegQuestions')
const { decrypt } = require('KegCrypto')
const { throwWrongPassword } = require('../error')
const { getSetting } = require('../globalConfig/getSetting')
const { DOCKER, GLOBAL_CONFIG_PATHS } = require('KegConst')
const gitKey = get(DOCKER, 'CONTAINERS.CORE.ARGS.GIT_KEY', 'GIT_KEY')

/**
 * Gets the git key to allow cloning private repos
 * Pulls from the ENV GIT_KEY or global config
 * @param {Object} globalConfig - Global config object for the Keg CLI
 *
 * @returns {string} - Found git key
 */
const getGitKey = async globalConfig => {
  if(process.env[ gitKey ]) return process.env[ gitKey ]

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