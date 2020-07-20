const { get, template } = require('@ltipton/jsutils')
const { loadComposeConfig } = require('KegUtils/docker/compose/loadComposeConfig')

const getConfig = contextEnvs => {
  const composePath = get(contextEnvs, `KEG_COMPOSE_DEFAULT`)
  return loadComposeConfig({ composePath, skipThrow: true })
}

/**
 * Loads the docker-compose.yml config. Looks for any ports
 * <br/>If found, converts the to docker arguments so they can be mounted
 * @param {Object} contextEnvs - Defined environment variables for the image
 *
 * @returns {Array} - Volumes to be mounted based on the docker-compose.yml file
 */
const getServicePorts = async (contextEnvs, composeConfig) => {
  if(!contextEnvs) return []

  composeConfig = composeConfig || await getConfig(contextEnvs)
  const composeService = get(contextEnvs, `KEG_COMPOSE_SERVICE`)

  // If no compose config or defined service, just return empty array
  if(!composeConfig || !composeService) return []

  const ports = get(composeConfig, `services.${ composeService }.ports`)
  if(!ports) return []
  
  return ports && ports.map(port => {
    // Ensure the correct regex for the template replace
    template.regex = /\${([^{]+[^}])}/g
    // Do template replace with the image context envs
    return template(`-p ${ port }`, contextEnvs)
  }) || []

}

module.exports = {
  getServicePorts
}