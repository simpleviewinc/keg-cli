const docker = require('KegDocCli')
const { copyBddRun } = require('KegUtils/helpers/copyBddRun')
const { generalError } = require('KegUtils/error/generalError')
const { runInternalTask } = require('KegUtils/task/runInternalTask')

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
const runReg = async args => {

  const exists = await docker.image.exists('keg-regulator')
  !exists &&
    generalError(`"keg-regulator" does not exist. You must build or run it first!`)

  // Copy the run script in-case there were updates
  await copyBddRun()

  // Step 5. Connect to the keg-regulator container and run the mini-cli
  return runInternalTask('tasks.docker.tasks.exec', {
    ...args,
    params: {
      ...params,
      cmd: params.cmd || cmd || `/bin/bash run.sh`,
      context: 'regulator',
      container: 'keg-regulator',
    },
  })

}

module.exports = {
  run: {
    name: `run`,
    alias: [ 'rn' ],
    action: runReg,
    description: `Runs the keg-regulator CLI again`,
    example: 'keg regulator run <options>',
    options: {
      cmd: {
        alias: [ 'entry', 'command' ],
        description: 'Overwrite entry of the image. Use escaped quotes for spaces ( bin/bash)',
        example: 'keg tap run --cmd \\"node index.js\\"',
        default: '/bin/bash run.sh'
      },
      log: {
        description: 'Log the docker run command to the terminal',
        example: 'keg tap run --log',
        default: false,
      }
    }
  }
}