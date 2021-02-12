const path = require('path')
const { Logger } = require('KegLog')
const { executeCmd } = require('KegProc')
const { readFileSync } = require('KegFileSys/fileSys')
const { isFunc, pickKeys, checkCall } = require('@keg-hub/jsutils')
const { getRepoPath } = require('../getters/getRepoPath')
const { generalError } = require('../error/generalError')

// TODO: Convert repo object to pretty prints
const convertToPretty = repoObj => {
  
  return repoObj
}

/**
 * Checks the format a repo should be in and converts it
 * <br/>Used to print the repos in easy to read format
 * @function
 * @param {Object} repoObj - Repo object built by the buildRepo method
 * @param {Object} package - The pacakge.json Object for the repo
 * @param {string} format - Format the repoObj should be converted to
 *
 * @returns {*} - repoObj in the converted format
 */
const convertFormat = (repoObj, package, format) => {
  return format === 'pretty'
    ? convertToPretty(repoObj)
    : repoObj
}

/**
 * Helper script to find the sub-repos of the keg-hub
 * @string
 */
const findSubNodeModules = 'find * -maxdepth 0 -type d | grep -Ev \'^(_)|node_modules\''

/**
 * Tries to load the package.json file of a repo
 * <br/>Logs warning if file can not be found
 * @function
 * @param {Object} repoPath - Path to the repo
 * @param {Object} repo - Name of the repo folder
 * @param {boolean} pathError - Log a warning when package.json can not be found
 *
 * @returns {Object} - Loaded package.json object for the repo
 */
const getPackageJson = (repoPath, repo, pathError=true) => {
  try {
    const rawdata = readFileSync(path.resolve(repoPath, 'package.json'))
    return JSON.parse(rawdata)
  }
  catch(error){
    pathError && Logger.warn(`Missing package.json file in keg-hub/repos folder "${repo}"!`)
    pathError && Logger.info(`Repo "${repo}" will not be included in task execution!`)
    return false
  }
}

/**
 * Builds a repoObj in a default format
 * <br/>Logs warning if file can not be found
 * @function
 * @param {Object} paths - Location where repos should be found
 * @param {string} paths.repo - Name of the repo folder
 * @param {string} paths.rootRepoPath - Path to the keg-hub/repos folder
 * @param {string} paths.searchPath - Location to search for sub-repos with package.json files
 * @param {boolean} paths.pathError - Log a warning when package.json can not be found
 * @param {Object} args - Passed from the task caller
 * @param {Object} args.format - Repo format the method should respond with
 * @param {Function} args.callback - custom callback
 * @param {Boolean} args.full - to build with all the info or not
 * 
 * @returns {Object} - Formatted repo information
 */
const buildRepo = (paths, args) => {
  const { repo, rootRepoPath, searchPath, pathError } = paths
  const { format, callback, full, subpath, tap } = args

  const repoPath =  path.join(searchPath, repo)
  const package = getPackageJson(repoPath, repo, pathError)

  return isFunc(callback)
    ? callback(
        repo,
        package,
        { ...args, location: repoPath, reposPath: rootRepoPath }
      )
    : !package
      ? false
      : full
        ? { repo, location: repoPath, package }
        : convertFormat({
          repo,
          location: repoPath,
          ...pickKeys(package, [
            'name',
            'version',
            'description'
          ])
        }, package, format)
}

/**
 * Builds the repos array
 * @function
 * @param {Array} repos - All repos to run command on
 * @param {Object} rootRepoPath - Path to the keg-hub/repos folder
 * @param {Object} searchPath - Location to search for sub-repos with package.json files
 * @param {Object} args - Passed from the task caller
 *
 * @returns {Array} - Formatted repo information
 */
const buildRepos = (repos, rootRepoPath, searchPath, args) => {
  const { context:filter, tap } = args

  // TODO: Add getTapConfig utility function
  // Use that to get the publish config for the tap
  // Would make sense to add it to the injection service
  // Then add it to the args passed to a task
  // That would allow taps to also be mono-repos, with multiple packages to publish
  // For now only the root package can be published
  // const builtRepos = !tap
  //   ? []
  //   : checkCall(() => {
  //       const pathSplit = rootRepoPath.split('/')
  //       return [
  //         buildRepo({
  //           pathError: true,
  //           repo: pathSplit.pop(),
  //           rootRepoPath: rootRepoPath,
  //           searchPath: pathSplit.join('/'),
  //         }, args)
  //       ]
  //     })

  if(tap){
    const pathSplit = rootRepoPath.split('/')
    return [
      buildRepo({
        pathError: true,
        repo: pathSplit.pop(),
        rootRepoPath: rootRepoPath,
        searchPath: pathSplit.join('/'),
      }, args)
    ]
  }

  return repos.reduce((repos, repo) => {
    const responses = repos

    const repoData = filter !== 'all' && !repo.includes(filter)
      ? false
      : buildRepo({ repo, rootRepoPath, searchPath, pathError: !Boolean(tap) }, args)
    
    repoData && responses.push(repoData)

    return responses

  }, builtRepos)

}


/**
 * Loads information about the repos in the keg-hub/repos folder
 * @function
 * @param {Object} args - Define how the repos information should be gathered
 * @param {string} args.context - Filter which repos should be returned (keg, retheme, components, etc)
 * @param {Object} args.callback - Callback method to override the default
 * @param {Object} args.format - Repo format the method should respond with
 * @param {Boolean} args.full
 * 
 * @returns {Array} - Group of promises resolving to formatted repo information
 */
const getHubRepos = async (args={}) => {
  const { tap, subpath='repos' } = args

  const rootRepoPath = tap
    ? getRepoPath(tap)
    : path.join(getRepoPath('hub'), 'repos')

  const searchPath = tap && subpath
    ? path.join(rootRepoPath, subpath)
    : rootRepoPath
  
  const { data, error } = await executeCmd(findSubNodeModules, { cwd: searchPath })
  error && generalError(error.stack)

  const repos = data.trim().split('\n')

  return buildRepos(repos, rootRepoPath, searchPath, args)
}

module.exports = {
  getHubRepos
}
