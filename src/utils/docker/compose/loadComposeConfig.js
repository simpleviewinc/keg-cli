const { yml } = require('KegPConf')
const { throwNoComposeService } = require('../../error/throwNoComposeService')
const { getContainerConst } = require('../getContainerConst')

/**
 * Loads a docker-compose file based on passed in path
 * @param {Object} args - args used to find the compose file
 * @param {Object} args.composePath - Path to the docker-compose file
 * @param {Object} args.context - Container context of the docker-compose file to load
 *
 * @returns {Object} - Loaded docker-compose.yml config file
 */
const loadComposeConfig = async ({ composePath, context, skipThrow }) => {
  const location = composePath ||
    (context && getContainerConst(context, `ENV.KEG_COMPOSE_DEFAULT`))

  const composeConfig = location && await yml.load({ location }) || null

  return composeConfig || (!skipThrow && throwNoComposeService(location))
}

module.exports = {
  loadComposeConfig
}
