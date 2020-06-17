const { deepFreeze } = require('jsutils')
const containers = require('./containers')
const { defaultENVs, dockerEnv, images, locationContext } = require('./values')

const DOCKER = {
  ...require('./machine'),
  ...require('./run'),
  ...require('./volumes'),
  IMAGES: images,
  DOCKER_ENV: dockerEnv,
  LOCATION_CONTEXT: locationContext,
  CONTAINERS_PATH: defaultENVs.CONTAINERS_PATH,
}

// Add the CONTAINERS property, with a get function do it only get called when referenced
Object.defineProperty(DOCKER, 'CONTAINERS', { get: () => containers.containers, enumerable: true })

module.exports = deepFreeze({ DOCKER })