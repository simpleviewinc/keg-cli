const { Logger } = require('KegLog')
const { getProxyRoutes } = require('KegUtils/proxy/getProxyRoutes')
const { filterProxyRoutes } = require('KegUtils/proxy/filterProxyRoutes')
const { noOpObj, wordCaps, mapObj } = require('@keg-hub/jsutils')

/**
 * Logs the items returned from the traefik api to the terminal
 * @param {Array} items - Items returned from traefik api after being filtered
 *
 * @returns {Void}
 */
const logList = list => {
  Logger.subHeader(`Keg-Proxy Container Routes`)
  const groups = {}
  // Convert the array into an object grouped by app name
  list.map(item => {
    const [ name, ...rest ] = item.service.split('-')
    groups[name] = groups[name] || []
    groups[name].push({
      branch: `    * ${rest.join('-')}`,
      url: `    * https://${item.rule.split('`')[1]}`
    })
  })

  // Print each group to the terminal
  mapObj(groups, (name, items) => {
    Logger.yellow(`  ${ wordCaps(name) }`)
    items.map(item => Logger.log(item.url))
    Logger.empty()
  })
  Logger.empty()

}

/**
 * Lists all containers registered to the keg-proxy
 * @param {Object} args - arguments passed from the runTask method
 * @param {string} args.command - Initial command being run
 * @param {Array} args.options - arguments passed from the command line
 * @param {Object} args.tasks - All registered tasks of the CLI
 * @param {Object} globalConfig - Global config object for the keg-cli
 *
 * @returns {void}
 */
const listProxy = async args => {
  const { params, __internal=noOpObj } = args
  const { filter, env} = params
  const log = __internal.skipLog !== true && params.log

  const list = await getProxyRoutes(env)
  const filtered = filterProxyRoutes(list, filter)
  log && logList(filtered)

  return filtered
}

module.exports = {
  list: {
    name: 'list',
    alias: [ 'ls', 'print', 'pr' ],
    action: listProxy,
    description: `Lists the currently running containers and their URLs`,
    example: 'keg proxy list <options>',
    options: {
      filter: {
        description: 'Filter items displayed the printed list. Matching items will be shown',
        example: 'keg proxy list --filter proxy',
      },
      log: {
        alias: [ 'lg', 'print', 'pr' ],
        description: 'Print the items to the terminal',
        example: 'keg proxy list --no-log',
        default: true
      }
    }
  }
}
