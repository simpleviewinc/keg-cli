const { throwWrap } = require('KegUtils/error/throwWrap')
const { get, isFunc, isNum, exists } = require('@svkeg/jsutils')
const { Logger } = require('KegLog')
const { git } = require('KegGitCli')
const { runInternalTask } = require('KegUtils/task/runInternalTask')
const { generalError } = require('KegUtils/error')
const { ask } = require('askIt')


const getBranchName = async (branches, branch, params) => {
  const { remove, list } = params
  // If remove is truthy, check if we should ask for the name/index
  // Otherwise check if branch has a value, if not ask for it
  // Else default to passed in branch
  let useBranch = list && !branch
    ? await ask.input('Please enter the branch name or index')
    : remove
      ? remove === true
        ? await ask.input('Please enter the branch name or index')
        : remove
      : !branch
        ? await ask.input('Please enter the branch name or index')
        : branch
  
  // Check if the useBranch in a numbered index
  // If it is, use it to pull the name from the branch list
  const branchIndex = parseInt(useBranch)
  return isNum(branchIndex) && branches[branchIndex]
    ? branches[branchIndex].name
    : useBranch
}

/**
 * Creates a new Git branch
 * @param {string} newBranch - Name of new branch to create
 * @param {Object} location - Location of the repo for the branches
 * @param {Object} params - Parsed options from the cmd line
 * @param {boolean} log - Should log task information
 *
 * @returns {void}
 */
const createNewBranch = async (newBranch, location, params, log=true) => {
  await git.repo.checkout({ ...params, branch: newBranch, newBranch, location })
  log && Logger.pair(`Switching to new branch:`, `"${ newBranch }"`)
  
}

/**
 * Git branch task
 * @param {string} branch - Branch to run action on
 * @param {Array} branches - Array of all current branches
 * @param {Object} location - Location of the repo for the branches
 * @param {Object} params - Parsed options from the cmd line
 *
 * @returns {void}
 */
const doBranchAction = async (branch, branches, location, params) => {

  const { remove } = params
  const useBranch = await getBranchName(branches, branch, params)

  return !exists(useBranch)
    ? generalError(`Git branch task requires a valid branch name or index!\nGot "${ useBranch }" instead!`)
    : !remove
      ? git.repo.checkout({ ...params, branch: useBranch, location })
      : git.branch.delete({ ...params, branch: useBranch, location })

}

/**
 * Git branch task
 * @param {Object} args - arguments passed from the runTask method
 * @param {string} args.command - Initial command being run
 * @param {Array} args.options - arguments passed from the command line
 * @param {Object} args.tasks - All registered tasks of the CLI
 * @param {Object} globalConfig - Global config object for the keg-cli
 *
 * @returns {void}
 */
const gitBranch = async args => {
  const { params } = args
  const { branch, context, list, new:newBranch, tap, delete:remove, ...gitParams } = params
  
  // Auto call the list task if we reach the gitBranch root task
  const { branches, location } = await runInternalTask('tasks.git.tasks.branch.tasks.list', {
    ...args,
    params: { context, location: params.location, tap },
    __internal: {
      ...args.__internal,
      __skipLog: !list && Boolean(branch || newBranch),
    },
  })

  return newBranch
    ? createNewBranch(newBranch, location, gitParams, gitParams.log)
    : (branch || remove) && doBranchAction(branch, branches, location, { list, remove, ...gitParams })

}

module.exports = {
  branch: {
    name: 'branch',
    alias: [ 'br' ],
    action: gitBranch,
    description: `Run git branch commands on a repo.`,
    example: 'keg branch <options>',
    tasks: {
      ...require('./list'),
      ...require('./current'),
    },
    options: {
      branch: {
        description: 'Create a new branch for the context or location',
        example: 'keg git branch --branch my-git-branch',
      },
      context: {
        alias: [ 'name' ],
        description: 'Name of the repo to show branches of, may also be a linked tap',
        example: 'keg git branch context=core',
      },
      location: {
        alias: [ 'path', 'loc' ],
        description: `Location when the git branch command will be run`,
        example: 'keg git branch location=<path/to/git/repo>',
        default: process.cwd()
      },
      tap: {
        description: 'Name of the tap to build a Docker image for',
        example: 'keg git branch --tap visitapps',
      },
      new: {
        description: 'Create a new branch for the context or location',
        example: 'keg git branch --new my-new-branch',
      },
      delete: {
        alias: [ 'del', 'remove', 'rm' ],
        description: 'Delete a branch from the list of branches',
        example: 'keg git branch --delete branch-to-remove',
      },
      force: {
        description: `Force the git fetch action, including pruning local branches`,
        example: 'keg git branch --force',
        default: false
      },
      sub: {
        alias: [ 'submodules', 'modules', 'recurse' ],
        description: `Recursively run a git action on any git submodules`,
        example: 'keg git branch --sub',
        default: false
      },
      list: {
        alias: [ 'ls', 'switch', 'sw' ],
        description: `Prints the current branchs, and asks for a branch to switch to`,
        example: 'keg git branch --list',
      },
      log: {
        alias: [ 'lg' ],
        description: `Logs the git command being run`,
        example: 'keg git branch --log',
        default: false
      },
    }
  }
}
