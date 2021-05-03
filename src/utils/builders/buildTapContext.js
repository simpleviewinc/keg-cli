const { git } = require('KegGitCli')
const { generalError, throwNoTapLink } = require('../error')
const { CONTEXT_TO_CONTAINER } = require('KegConst/constants')
const { getTapPath } = require('KegRepos/cli-utils')

const internalContexts = Object.keys(CONTEXT_TO_CONTAINER)

/**
 * Checks if the context is tap, and gets the Tap path if needed
 * @function
 * @param {Object} globalConfig - Global config object for the keg-cli
 * @param {string} cmdContext - Context to run the docker container in
 * @param {string} tap - Name of the tap to execute task on
 * @param {Object} envs - Group envs passed to docker command being run
 * @param {Object} task - Current task being run
 *
 * @returns {Object} - ENVs for the context, with the KEG_CONTEXT_PATH added if needed
 */
const buildTapContext = async ({ globalConfig, cmdContext, tap, envs }) => {
  // If the context is not a tap, or the KEG_CONTEXT_PATH is already set, just return
  if(internalContexts.includes(cmdContext)) return envs

  // Should only get here if we are trying to run a tap in docker
  // So at this point tap should be the name of the linked tap to run
  // Ensure there is a tap to find the link for
  !tap && generalError(
    `The 'tap' argument is required when no 'context' argument exists or 'context' is set to 'tap' when running this task!`
  )

  const tapPath = getTapPath(globalConfig, tap)

  const tapUrl = tapPath && await git.utils.remoteUrl(tapPath)

  return !tapPath
    ? throwNoTapLink(globalConfig, tap)
    : {
        ...envs,
        KEG_CONTEXT_PATH: tapPath,
        ...(tapUrl && { GIT_APP_URL: tapUrl }),
        // May want to override the container name here
        // This way we can have more then one tap docker container running at a time
        // But we can't do this until keg-proxy is setup
        // CONTAINER_NAME: tap
      }

}

module.exports = {
  buildTapContext
}