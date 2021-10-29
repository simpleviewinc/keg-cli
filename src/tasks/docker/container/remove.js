const docker = require('KegDocCli')
const { Logger } = require('KegLog')
const { exists } = require('@keg-hub/jsutils')
const { generalError } = require('KegUtils/error')
const { dockerLog } = require('KegUtils/log/dockerLog')
const { confirmExec } = require('KegUtils/helpers/confirmExec')
const { getSetting } = require('KegUtils/globalConfig/getSetting')
const { containerSelect } = require('KegUtils/docker/containerSelect')
const { getContainerConst } = require('KegUtils/docker/getContainerConst')

/**
 * Gets the container from a passed in context
 * @param {Object} context - Context to get the container from
 *
 * @returns {void}
 */
const getContainerRef = async (context, throwErr) => {
  // Ensure we have an container to remove by checking for a mapped context, or use original
  const containerRef = context && getContainerConst(context, `env.image`, context)
  let container = containerRef && await docker.container.get(containerRef)

  // Use the found container || Ask the user so select the container
  container = container || await containerSelect(null, throwErr)

  // Return the container meta data
  // Or if still no container, throw an error
  return container || (throwErr && generalError(
    `The docker container with context "${ context }" can not be found!`
  ))

}

/**
 * Removes all containers found from docker.container.list()
 * @param {Object} params
 * @param {boolean} params.force - Force removes the docker container
 * @param {boolean} params.confirm - Should removing all the containers be confirmed
 *
 * @returns {void}
 */
const removeAllContainers = async ({ force, confirm }) => {
  return await confirmExec({
    success: `All docker containers removed`,
    cancel: `Remove all docker containers canceled!`,
    confirm: `Are you sure you want to remove all docker containers?`,
    preConfirm: !confirm,
    execute: async () => {
      const containers = await docker.container.list()
      return await Promise.all(
        containers.map(async container => {
          return await docker.container.remove({
            item: container.id,
            force
          })
        })
      )
    },
  })
}

/**
 * Remove a docker container
 * @param {Object} args - arguments passed from the runTask method
 * @param {string} args.command - Initial command being run
 * @param {Array} args.options - arguments passed from the command line
 * @param {Object} args.tasks - All registered tasks of the CLI
 * @param {Object} globalConfig - Global config object for the keg-cli
 *
 * @returns {void}
 */
const removeContainer = async args => {
  const { params, __internal={} } = args
  const { all, confirm, context, many } = params

  const throwErr = !__internal.skipThrow
  const force = exists(params.force) ? params.force : getSetting(`docker.force`)

  // If all is set, then remove all containers
  if(all) return await removeAllContainers({force, confirm})

  const container = !context
    ? await containerSelect()
    : docker.isDockerId(context)
      ? { id: context }
      : await getContainerRef(context, throwErr)

  // Ensure we have the container meta data, and try to remove by containerId
  // __internal.skipThrow is an internal argument, so it's not documented
  if(!container || !container.id)
    return exists(many)
      ? Logger.log(`\nExiting docker container remove\n`)
      : throwErr && generalError(`The docker container "${ containerRef }" can not be found!`)

  const res = await docker.container.remove({ item: container.id, force })

  // Log the output of the command
  return many
    ? removeContainer(args)
    : dockerLog(res, 'container remove')
}

module.exports = {
  remove: {
    name: 'remove',
    alias: [ 'rm', 'rmc' ],
    action: removeContainer,
    description: `Remove docker container by name`,
    example: 'keg docker container remove <options>',
    options: {
      context: {
        alias: [ 'name' ],
        description: 'Name or ID of the container to remove',
        example: 'keg docker container remove --name core',
      },
      force: {
        description: 'Add the force argument to the docker command',
        example: 'keg docker container remove --force',
      },
      all: {
        description: 'Remove all containers',
        example: 'keg docker container remove --all',
      },
      many: {
        alias: [ 'multiple', 'multi' ],
        description: 'Remove multiple containers one after the other',
        example: 'keg docker container remove --many',
      },
      confirm: {
        description: 'Confirm before setting the value.',
        example: 'keg docker container remove --no-confirm',
        default: true,
      },
    },
  }
}
