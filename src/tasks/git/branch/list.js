const { getGitPath } = require('KegUtils/git/getGitPath')
const { printGitBranches } = require('KegUtils/git/printGitBranches')
const { generalError } = require('KegUtils/error')
const { git } = require('KegGitCli')

const branchList = async (args) => {
  const { globalConfig, params, __internal={} } = args
  const { context, location, tap } = params
  const { __skipLog } = __internal

  const gitPath = getGitPath(globalConfig, tap || context) || location

  if(!gitPath) throw new Error(`Git path does not exist for ${ context || location }`)

  const branches = await git.branch.list(gitPath)

  // Check if we should print the branch list
  !__skipLog && printGitBranches(branches)
  
  return { branches, location: gitPath }
}

module.exports = {
  list: {
    name: 'list',
    alias: [ 'ls' ],
    description: 'Prints list of local branch for a git repo',
    action: branchList,
    options: {
      context: {
        alias: [ 'name' ],
        description: 'Name of the repo to show branches of, may also be a linked tap',
        example: 'keg git branch context=core',
      },
      location: {
        alias: [ 'loc' ],
        description: `Location when the git branch command will be run`,
        example: 'keg git branch location=<path/to/git/repo>',
        default: process.cwd()
      },
      tap: {
        description: 'Name of the tap to build a Docker image for',
        example: 'keg git current --tap visitapps',
      },
    }
  }
}
