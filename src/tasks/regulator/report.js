const { getRepoPath } = require('KegUtils/getters/getRepoPath')
const { executeCmd } = require('KegProc')
const { Logger } = require('KegLog')
/**
 * Open the latest keg regulator report
 * @param {Object} args - arguments passed from the runTask method
 * @param {string} args.command - Initial command being run
 * @param {Array} args.options - arguments passed from the command line
 * @param {Object} args.tasks - All registered tasks of the CLI
 * @param {Object} globalConfig - Global config object for the keg-cli
 *
 * @returns {void}
 */
const reportReg = async args => {
  const { command, options, globalConfig, params } = args
  
  const regulatorPath = getRepoPath('regulator')

  Logger.info(`Opening latest report in for Keg-Regulator tests!`)
  await executeCmd(`yarn report`, { cwd: regulatorPath })

}

module.exports = {
  report: {
    name: 'report',
    alias: [ 'rep', 'rpt' ],
    action: reportReg,
    description: `Open the latest report for the Keg-Regulator`,
    example: 'keg regulator report <options>',
  }
}