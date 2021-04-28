const { executeCmd } = require('./process')
const { PATTERNS } = require('../constants/constants')

const { NEWLINES_MATCH, WHITESPACE_MATCH } = PATTERNS

/**
 * Calls git remote at the passed in path
 * Then searches a matching remote, and returns its url
 * @function
 * @param {Object} [remote=origin] - Name of git remote
 * @param {Object} [repoPath=process.cwd()] - Path of the repo locally
 *
 * @returns {string} - Git remote's url
 */
const remoteUrl = async (repoPath=process.cwd(), remote='origin') => {
  const { data, error } = await executeCmd(`git remote -v`, { cwd: repoPath })

  return error
    ? null
    : data.split(NEWLINES_MATCH)
      .reduce((gitUrl, line) => {
        // If the gitUrl is set, then return it
        if(gitUrl) return gitUrl
        
        // Break the line down into parts, split based on space
        const [ name, url, type ] = line.split(WHITESPACE_MATCH)

        // If it's the origin remote, then use it's url
        return name === remote ? url : gitUrl

      }, null)
}

module.exports = {
  remoteUrl
}