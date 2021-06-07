const path = require('path')
const { env } = require('KegPConf')
const { cliRootDir } = require('./values')
const { deepFreeze, reduceObj } = require('@keg-hub/jsutils')

const envType = process.env.KEG_DOCKER_MACHINE
  ? `machine`
  : `desktop`

// Load the docker-machine ENVs from same file as setup script
const machineEnvs = env.loadSync({
  location: path.join(cliRootDir, `scripts/docker/docker-${envType}.env`),
})

/*
 * Builds the docker machine config
 *
 * @returns {Object} - Built machine config
*/
module.exports = deepFreeze({
  PREFIXED: machineEnvs,
  // Use the same ENV file as the setup script, but remove the KEG_DOCKER_ prefix
  DOMAIN_ENVS: reduceObj(machineEnvs, (key, value, cleaned) => {
    cleaned[key.replace('KEG_DOCKER_', '')] = value

    return cleaned
  }, {})
})