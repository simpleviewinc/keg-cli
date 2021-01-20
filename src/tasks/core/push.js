const { DOCKER } = require('KegConst/docker')
const { runInternalTask } = require('KegUtils/task/runInternalTask')
const { checkImageExists } = require('KegUtils/docker/checkImageExists')
const { mergeTaskOptions } = require('KegUtils/task/options/mergeTaskOptions')

/**
 * Pushes a local keg-core image to a registry provider in the cloud
 * @param {Object} args - arguments passed from the runTask method
 * @param {string} args.command - Initial command being run
 * @param {Array} args.options - arguments passed from the command line
 * @param {Object} args.tasks - All registered tasks of the CLI
 * @param {Object} globalConfig - Global config object for the keg-cli
 *
 * @returns {void}
 */
const pushCore = async (args) => {
  const { params } = args
  const { build, log, env, tag=env } = params
  const exists = await checkImageExists({ image: 'keg-core', tag })

  await runInternalTask(
    'tasks.docker.tasks.provider.tasks.push',
    {
      ...args,
      command: 'push',
      params: {
        ...args.params,
        context: 'core',
        image: 'keg-core',
        build: !exists,
        tag,
      }
    }
  )

}

module.exports = {
  push: {
    name: 'push',
    alias: [ 'psh' ],
    action: pushCore,
    description: `Pushes a new keg-base docker image to the provider`,
    example: 'keg core push',
    options: mergeTaskOptions(`core`, `push`, `push`),
  }
}