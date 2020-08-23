const { spawnCmd } = require('spawn-cmd')
const { getRepoPath } = require('KegUtils/getters/getRepoPath')
const { throwNoConfigPath } = require('KegUtils/error/throwNoConfigPath')

/**
 * Validate task for keg-cli
 * @param {Object} args - arguments passed from the runTask method
 * @param {string} args.command - Initial command being run
 * @param {Array} args.options - arguments passed from the command line
 * @param {Object} args.tasks - All registered tasks of the CLI
 * @param {Object} globalConfig - Global config object for the keg-cli
 *
 * @returns {void}
 */
const publishPackage = async args => {
  const { command, globalConfig, options, params, tasks } = args
  const { context, location } = params
  
  const contextPath = location || getRepoPath(context)

  contextPath
    ? await spawnCmd(`np`, { args: [], cwd: contextPath })
    : throwNoConfigPath(globalConfig, location || context)

}

module.exports = {
  publish: {
    name: 'publish',
    alias: [ 'pub', 'np' ],
    action: publishPackage,
    description: `Validate the keg-cli is setup correctly!`,
    example: 'keg global publish',
    options: {
      context: {
        description: 'Context of name of the package to publish',
        example: 'keg global publish core',
      },
      location: {
        description: 'Location of the repo to publish, if not in paths or linked',
        example: 'keg global publish --location path/to/my/repo',
      }
    }
  }
}