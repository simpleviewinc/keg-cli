const { Logger } = require('KegLog')
const { mutagen } = require('KegMutagen')

/**
 * Start the mutagen daemon
 * @param {Object} args - arguments passed from the runTask method
 * @param {string} args.command - Initial command being run
 * @param {Array} args.options - arguments passed from the command line
 * @param {Object} args.tasks - All registered tasks of the CLI
 * @param {Object} globalConfig - Global config object for the keg-cli
 *
 * @returns {void}
 */
const mutagenCreate = async args => {
  const { command, globalConfig, options, params, tasks } = args

  console.log(`---------- create ----------`)


}

module.exports = {
  create: {
    name: 'create',
    alias: [ 'cr' ],
    action: mutagenCreate,
    description: `Start mutagen daemon`,
    example: 'keg mutagen start',
    options: {}
  }
}
