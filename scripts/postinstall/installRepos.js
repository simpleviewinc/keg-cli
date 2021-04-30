const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const reposPath = path.join(__dirname, '../../', 'repos')

/**
 * Finds all sub-repo paths from the <root>/repos directory
 * @type {function}
 * 
 * @return {Object} - Found repo paths by name
 */
const getRepoPaths = () => {
  // list of the repo names located at `<root>/repos`
  const repos = execSync('ls', { cwd: reposPath })
    .toString()
    .split('\n')
    .filter(Boolean)

  // object of env names to repo paths
  return repos.reduce(
    (values, name) => {
      const repo = path.join(reposPath, name)
      fs.existsSync(path.join(repo, `./package.json`)) && (values[name] = repo)

      return values
    },
    {}
  )
}

/**
 * Runs yarn install for all sub repos, called from `scripts.postinstall` of root package.json
 * @type {function}
 * 
 */
const installRepos = () => {
  const repos = getRepoPaths()
  Object.entries(repos).map(([name, repo]) => {
    console.log(`\nRunning yarn install for ${name}`)
    const response = execSync('yarn', { cwd: repo })
    console.log(response.toString())
  })
}

/**
 * Check if the parent module has a parent
 * If it does, then it was called from code
 * So we should return the method instead of running it automatically
 * 
*/
require.main === module ? installRepos() : (module.exports = { installRepos })