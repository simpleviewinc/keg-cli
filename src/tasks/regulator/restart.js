const { copyBddRun } = require('KegUtils/helpers/copyBddRun')
const { bddService } = require('KegUtils/services')

/**
 * Restart the keg-regulator container with docker-compose
 * @param {Object} args - arguments passed from the runTask method
 * @param {string} args.command - Initial command being run
 * @param {Array} args.options - arguments passed from the command line
 * @param {Object} args.tasks - All registered tasks of the CLI
 * @param {Object} globalConfig - Global config object for the keg-cli
 *
 * @returns {void}
 */
const restart = async args => {
  const { params: { log, script } } = args

  // Copy the run script in-case there were updates
  await copyBddRun()

  // Run the bddService again
  // It will check the task name, and rerun compose restart when the task is restart
  return bddService(args, { context: 'regulator', container: 'keg-regulator', cmd: `sh run.sh` })

}

module.exports = {
  restart: {
    name: `restart`,
    alias: [ 'rest', 'rerun', 'rr', 'rst' ],
    action: restart,
    description: `Restart the keg-regulator container with docker-compose`,
    example: 'keg regulator restart <options>',
    options: {
      log: {
        description: "Auto-log the container output on restart",
        example: 'keg regulator restart --log false',
        default: true
      }
    }
  }
}