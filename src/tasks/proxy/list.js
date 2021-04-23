const axios = require('axios')
const { Logger } = require('KegLog')
const { limbo, isArr, noOpObj, wordCaps } = require('@keg-hub/jsutils')
const { generalError } = require('KegUtils/error/generalError')
const { getSetting } = require('KegUtils/globalConfig/getSetting')

const defFilters = [
  'dashboard@internal',
  'ping@internal',
  'api@internal'
]

/**
 * Gets a list of all containers registered to the keg-proxy
 * @param {Object} env - The env the keg-proxy was started in
 *
 * @returns {Array} - List of container routes from traefik
 */
const getListFromAPI = async env => {
  const domain = getSetting('defaultDomain')
  const [ err, res ] = await limbo(axios.get(`http://${env}.${domain}/api/http/routers`))

  return err
    ? generalError(err.message)
    : !isArr(res.data)
      ? generalError(`No routes returned from the proxy server!`, res)
      : res.data
}

/**
 * Filters items returned from the traefik api based on the passed in filter
 * @param {Object} items - Items returned from traefik api
 * @param {string} filter - Text content that items should contain to be included
 *
 * @returns {Array} - All items that match the passed in filter
 */
const filterList = (list, filter) => {
  return list.reduce((filtered, item) => {
    item &&
      (!filter || !(
        (filter !== 'no-internal' && !item.service.includes(filter)) ||
        defFilters.includes(item.service)
      )) &&
      filtered.push(item)

    return filtered
  }, [])

}

/**
 * Logs the items returned from the traefik api to the terminal
 * @param {Object} items - Items returned from traefik api after being filtered
 *
 * @returns {Void}
 */
const logList = list => {
  Logger.subHeader(`Keg-Proxy Container Routes`)
  list.map(item => {
    const [ name, ...rest ] = item.service.split('-')
    Logger.yellow(`  ${ wordCaps(name) }`)

    const branch = rest.join('-')
    Logger.pair(`    * ${branch}:`, `https://${item.rule.split('`')[1]}`)
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

  const list = await getListFromAPI(env)
  const filtered = filterList(list, filter)
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
        default: 'no-internal'
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
