const { checkCall, reduceObj, isStr, deepMerge } = require('@ltipton/jsutils')
const { NEWLINES_MATCH, WHITESPACE_MATCH } = require('KegConst/patterns')

/**
* Extra git log arguments map. Maps passed in arguments to the real value
* @Object
*
*/
const gitLogArgs = {
  abbrev: 'abbrev-commit',
  pretty: 'pretty=oneline',
}


let GIT_SSH_COMMAND

/**
* Builds the GIT_SSH_COMMAND env for running git commands
* @function
* @param {string} keyPath - Path to the git ssh key locally
*
* @returns {string} - Built ssh command string
*/
const gitSSHEnv = keyPath => {
  if(!keyPath) return {}
  
  // Build the ssh key options
  let sshCmd = `ssh -i ${keyPath}`
  sshCmd += ` -o BatchMode=yes`
  sshCmd += ` -o UserKnownHostsFile=/dev/null`
  sshCmd += `-o StrictHostKeyChecking=no`

  // Cache the ssh options so we can use them in the buildCmdOpts helper
  GIT_SSH_COMMAND = { GIT_SSH_COMMAND: sshCmd }

  return GIT_SSH_COMMAND

}

/**
* Finds the arguments that should be passed to the git log command
* @function
* @param {Object} params - Parsed params passed from the command line
*
* @returns {string} - Built argument string
*/
const getLogArgs = params => {
  return reduceObj(params, (key, value, joined) => {
    return !value
      ? joined
      : gitLogArgs[key]
        ? `${joined} --${gitLogArgs[key]}`
        : `${joined} --${key}`

  }, '').trim()
}

/**
 * Formats the gitCli response for remotes into a json object
 * @function
 * @param {string|Array} remotes - text response from the gitCli
 *
 * @returns {Array} - Formatted remote objects
 */
const formatRemotes = (remotes='') => {
  const lines = isStr(remotes)
    ? remotes.split(NEWLINES_MATCH)
    : remotes

  return lines.reduce((mapped, line) => {
    return !line.trim()
      ? mapped
      : mapped.concat(checkCall(() => {
          const [ name, url ] = line.split(WHITESPACE_MATCH)
          return { name, url }
        }))
  }, [])
}

/**
 * Adds the location to the cmdOptions
 * @function
 * @param {Object} cmdOpts - Options to pass to the spawnCmd
 * @param {Object} args - Extra options to pass to the spawnCmd
 *
 * @returns {Object} - Joined cmd options
 */
const buildCmdOpts = (cmdOpts, { location }) => {
  const options = GIT_SSH_COMMAND
    ? deepMerge(cmdOpts.options, { env: { ...GIT_SSH_COMMAND } })
    : cmdOpts.options

  return location
    ? { ...cmdOpts, cwd: location, options }
    : { ...cmdOpts, options }
}

/**
 * Gets a remote from current remotes, or uses the default
 * <br/>Also ensures the remote exists
 * @function
 * @param {string} remote - Remote to ensure
 *
 * @returns {string} - Joined cmd options
 */
const ensureGitRemote = async (git, { action, remote, location }) => {
  // TODO: If remote is not origin, make call to check if remote exists
  return remote || 'origin'
}

const ensureGitBranch = async (git, { action, branch, location, remote, to }) => {
  // TODO: make call to get list all branches
  // Ensure the branch exists, if no branch exists, ensure the remote exists
  return to || branch
}

module.exports = {
  buildCmdOpts,
  formatRemotes,
  gitSSHEnv,
  getLogArgs,
  ensureGitRemote,
}