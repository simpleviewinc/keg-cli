const { get } = require('@ltipton/jsutils')
const { getBoundServicePorts } = require('./getServicePorts')
const { getServiceVolumes } = require('./getServiceVolumes')
const { getComposeConfig } = require('./getComposeConfig')

/**
 * Gets values form the docker-compose.yml config based on service name
 * @param {string=} composePath - Path to the docker-compose.yml file to load
 * @param {Object} contextEnvs - Defined environment variables for the container
 * @param {Array} opts - Already added docker command arguments 
 *
 * @returns {Array} - opts array updated with docker-compose service values
 */
const getServiceValues = async ({ composePath, contextEnvs, opts=[] }) => {

  const composeConfig = await getComposeConfig(contextEnvs, composePath)
  if(!composeConfig) return opts

  const ports = await getBoundServicePorts(contextEnvs, composeConfig)
  opts = opts.concat(ports)

  const volumes = await getServiceVolumes(contextEnvs, composeConfig)

  opts = opts.concat(volumes)

  return opts

}

module.exports = {
  getServiceValues
}