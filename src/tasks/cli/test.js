const { spawnCmd } = require('@keg-hub/spawn-cmd')
const { getRepoPath } = require('KegUtils/getters/getRepoPath')
const { throwNoConfigPath } = require('KegUtils/error/throwNoConfigPath')

/**
 * Gets the type of tests to run
 * @param {Object} args - arguments passed from the runTask method
 * @param {Object} args.params - Command like options formatted into an object
 *
 * @returns {string} - Test type to run
 */
const getTestsType = ({ type, e2e, jest }) => {
  return e2e || type === 'e2e' ? 'test:e2e' : 'test:jest'
}

/**
 * Default keg cli task
 * @param {Object} args - arguments passed from the runTask method
 * @param {string} args.command - Initial command being run
 * @param {Array} args.options - arguments passed from the command line
 * @param {Object} args.tasks - All registered tasks of the CLI
 * @param {Object} globalConfig - Global config object for the keg-cli
 *
 * @returns {void}
 */
const cliTest = async args => {
  const { globalConfig, params } = args
  const testType = getTestsType(params)
  const cliPath = getRepoPath('cli')

  cliPath
    ? await spawnCmd(`yarn`, { args: [ testType, ...(params.args || []) ], cwd: cliPath })
    : throwNoConfigPath(globalConfig, 'cli')

}

module.exports = {
  test: {
    name: 'test',
    alias: [],
    action: cliTest,
    description: 'Test the Keg CLI',
    example: 'keg cli test <options>',
    options: {
      type: {
        description: 'Type of Keg-CLI tests to run',
        example: 'keg cli test --type e2e',
        type: 'string',
        default: 'jest'
      },
      e2e: {
        description: 'Run Keg-CLI end to end tests',
        example: 'keg cli test --e2e',
        type: 'bool',
        default: false
      },
      jest: {
        description: 'Run Keg-CLI jest tests',
        example: 'keg cli test --jest',
        type: 'bool',
        default: false
      },
      args: {
        description: 'Comma separated arguments to pass to the tests command when run',
        example: 'keg cli test --e2e --args docker',
        type: 'array',
        default: []
      }
    }
  }
}
