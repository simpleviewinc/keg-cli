const { runInternalTask } = require('KegUtils/task/runInternalTask')
const { DOCKER } = require('KegConst/docker')

/**
 * Attach to the running keg-tap container
 * @param {Object} args - arguments passed from the runTask method
 * @param {string} args.command - Initial command being run
 * @param {Array} args.options - arguments passed from the command line
 * @param {Object} args.tasks - All registered tasks of the CLI
 * @param {Object} globalConfig - Global config object for the keg-cli
 *
 * @returns {void}
 */
const attach = args => {
  // Connect to the tap image through internal task
  return runInternalTask('tasks.docker.tasks.exec', {
    ...args,
    params: {
      context: 'tap',
      ...args.params,
    },
  })
}

module.exports = {
  attach: {
    name: 'attach',
    alias: [ 'att' ],
    inject: true,
    action: attach,
    locationContext: DOCKER.LOCATION_CONTEXT.REPO,
    description: `Attach to the running tap container`,
    example: 'keg tap attach',
    options: {
      cmd: {
        description: 'Docker container command to run. Default ( /bin/bash )',
        example: 'keg tap att --cmd test',
        default: 'bash'
      },
      options: {
        alias: [ 'opts' ],
        description: 'Extra docker exec command options',
        default: '-it'
      },
      tag: {
        alias: [ 'tg' ],
        description: 'Tag on the image that should be attached to',
        example: 'keg tap att tag=my-tag',
      },
      prefix: {
        alias: [ 'type' ],
        description: 'The container prefix type. For accessing containers with added prefixes',
        example: 'keg tap att --prefix package',
      },
      name: {
        alias: ['branch'],
        description: 'Partial name of the container to help filter the found containers',
        example: 'keg tap att --prefix img --name feature-branch',
      }
    }
  }
}