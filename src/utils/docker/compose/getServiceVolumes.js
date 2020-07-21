const { get, template } = require('@ltipton/jsutils')
const { getComposeConfig } = require('./getComposeConfig')

/**
 * Loads the docker-compose.yml config. Looks for any volumes
 * <br/>If found, converts the to docker arguments so they can be mounted
 * @param {Object} contextEnvs - Defined environment variables for the image
 *
 * @returns {Array} - Volumes to be mounted based on the docker-compose.yml file
 */
const getServiceVolumes = async (contextEnvs, composeConfig) => {
  if(!contextEnvs) return []

  composeConfig = composeConfig || await getComposeConfig(contextEnvs)
  const composeService = get(contextEnvs, `KEG_COMPOSE_SERVICE`)

  // If no compose config or defined service, just return empty array
  if(!composeConfig || !composeService) return []

  const volumes = get(composeConfig, `services.${ composeService }.volumes`)
  if(!volumes) return []
  
  return volumes && volumes.map(volume => {
    // Ensure the correct regex for the template replace
    template.regex = /\${([^{]+[^}])}/g
    // Do template replace with the image context envs
    return template(`-v ${ volume }`, contextEnvs)
  }) || []

}

module.exports = {
  getServiceVolumes
}