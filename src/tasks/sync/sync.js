const { Logger } = require('KegLog')

/**
 * Mutagen commands for the Keg-CLI
 * @param {Object} args - arguments passed from the runTask method
 * @param {string} args.command - Initial command being run
 * @param {Array} args.options - arguments passed from the command line
 * @param {Object} args.tasks - All registered tasks of the CLI
 * @param {Object} globalConfig - Global config object for the keg-cli
 *
 * @returns {void}
 */
const mutagenSync = args => {
  const { command, globalConfig, options, params, tasks } = args
  console.log(`---------- mutagen ----------`)

}

module.exports = {
  sync: {
    name: 'sync',
    alias: [ 'mutagen', 'muta', 'mt' ],
    action: mutagenSync,
    description: `mutagen commands for the Keg-CLI`,
    example: 'keg mutagen <options>',
    tasks: {
      ...require('./start'),
      ...require('./stop'),
    },
    options: {
      
    }
  }
}