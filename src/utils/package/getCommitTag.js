const { git } = require('KegGitCli')

/**
 * Returns the passed in commitTag if it exists
 * Otherwise gets the current branch to use as the commit tag of the image
 * @function
 * @param {string} location - Local path of the repo to get the current branch from
 * @param {string} commitTag - Tag to use instead of the current git branch
 *
 * @returns {string} - Commit tag to use
 */
const getCommitTag = async (location, commitTag) => {
  if(commitTag) return commitTag

  const currentBr = await git.branch.current({ location })
  return currentBr && currentBr.name
}


module.exports = {
  getCommitTag
}