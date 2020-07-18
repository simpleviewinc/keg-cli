const path = require('path')
const { DOCKER } = require('KegConst/docker')
const { yml } = require('KegFileSys/yml')
const { get } = require('@ltipton/jsutils')
const { throwNoComposeService } = require('KegUtils/error/throwNoComposeService')
const { getContainerConst } = require('../getContainerConst')

/**
 * Loads a docker-compose file, and finds the first service name
 * @param {Object} args - args used to find the service name
 * @param {Object} args.composePath - Path to the docker-compose file
 * @param {Object} args.context - Container context of the docker-compose file to load
 *
 * @returns {string} - The first found service name
 */
const getServiceName = async ({ composePath, context }) => {
  const loadPath = composePath ||
    (context && getContainerConst(context, `ENV.KEG_COMPOSE_DEFAULT`))

  const composeConfig = loadPath && await yml.load(loadPath) || {}
  const services = composeConfig && get(composeConfig, 'services')

  return Object.keys(services).length
    ? Object.keys(services)[0]
    : throwNoComposeService(loadPath)

}


module.exports = {
  getServiceName
}