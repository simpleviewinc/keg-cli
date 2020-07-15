const { deepFreeze } = require('@ltipton/jsutils')
const containers = require('./containers')

const {
  cliKeyMap,
  dockerEnv,
  images,
  locationContext,
  mutagenMap,
  containersPath,
} = require('./values')

const DOCKER = {
  ...require('./machine'),
  ...require('./run'),
  ...require('./volumes'),
  CLI_KEY_MAP: cliKeyMap,
  IMAGES: images,
  DOCKER_ENV: dockerEnv,
  LOCATION_CONTEXT: locationContext,
  CONTAINERS_PATH: containersPath,
  MUTAGEN_MAP: mutagenMap,
}

// Add the CONTAINERS property, with a get function do it only get called when referenced
Object.defineProperty(DOCKER, 'CONTAINERS', { get: () => containers.CONTAINERS, enumerable: true })

module.exports = { DOCKER }