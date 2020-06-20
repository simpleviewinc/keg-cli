const docker = require('KegDocCli')
const { Logger } = require('KegLog')
const { mutagen } = require('KegMutagen')
const { DOCKER } = require('KegConst/docker')
const { buildLocationContext } = require('KegUtils/builders')
const { throwRequired, generalError } = require('KegUtils/error')

const getContainer = (args) => {
  const { globalConfig, params, task } = args
  const { context, container } = params
  
  container && docker.container.get(container)
  
  
}

/**
  Steps to do sync
  * Create or start the container
    * Need to get context first
    * Need to check if container already exists and by pass
  * Once container is running, get the container id
  * Load in mutagen config for the context
    * Should include ignores / mount locations / create args etc 
*/


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
  const { command, globalConfig, params, task } = args
  const { context, container, local, options, remote } = params

  // Ensure we have a content to build the container
  !context && !container && throwRequired(task, 'context', task.options.context)

  // Get the context data for the command to be run
  const locContext = await buildLocationContext({
    globalConfig,
    task,
    params,
  })


  console.log(`---------- create ----------`)
  console.log(locContext)


}

module.exports = {
  create: {
    name: 'create',
    alias: [ 'cr' ],
    action: mutagenCreate,
    description: `Creates a mutagen sync between the local filesystem and a docker container`,
    example: 'keg mutagen create <options>',
    options: {
      context: {
        alias: [ 'name' ],
        allowed: DOCKER.IMAGES,
        description: 'Context or name of the container to sync with',
        example: 'keg mutagen create --context core',
        enforced: true,
      },
      container: {
        alias: [ 'id' ],
        description: 'Name or Id of the container to sync with. Overrides context option',
        example: 'keg mutagen create --container my-container',
      },
      local: {
        alias: [ 'from' ],
        description: 'Local path to sync when container option is passed',
        example: 'keg mutagen create --container my-container --local ~/keg/keg-core',
        depends: { container: true },
        enforced: true,
      },
      remote: {
        alias: [ 'to' ],
        description: 'Remote path to sync when container option is passed',
        example: 'keg mutagen create --container my-container --remote keg/keg-core',
        depends: { container: true },
        enforced: true,
      },
      options: {
        alias: [ 'opts' ],
        description: 'Extra options to pass to the mutagen create command',
        example: 'keg mutagen create --options "--ignore /ignore/path"',
        depends: { container: true },
        enforced: true,
      },
      tap: {
        description: 'Name of the tap to build. Only needed if "context" argument is "tap"',
      },
    }
  }
}
