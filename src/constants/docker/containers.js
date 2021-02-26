const path = require('path')
const { KEG_ENVS } = require('../envs')
const { PREFIXED } = require('./domainEnvs')
const { containersPath, images } = require('./values')
const { loadValuesFiles, loadEnvFiles } = require('./loaders')
const { defineProperty } = require('../../utils/helpers/defineProperty')
const { checkArgsForEnv } = require('../../utils/helpers/checkArgsForEnv')
const { deepFreeze, deepMerge, keyMap, get, noOpObj } = require('@keg-hub/jsutils')
const { getDefaultEnv } = require('../../utils/globalConfig/getDefaultEnv')

/**
 * Holds each docker containers meta data that can be built by the CLI
 * @internal
 * @object
 */
let __CONTAINERS

// 
/**
 * Default container meta data for all containers that can be built by the CLI
 * @internal
 * @object
 */
const DEFAULT = {
  VALUES: {
    clean: '--rm',
    nocache: '--no-cache',
    entrypoint: '--entrypoint',
    connect: '-it',
    squash: '--squash',
  },
  DEFAULTS: {
    clean: true,
    connect: true,
    entrypoint: false,
    file: true,
    nocache: false,
    squash: false,
  },
  ARGS: keyMap([
    'GIT_KEY',
    'GIT_CLI_URL',
  ], true),
  ENV: {},
  // Filter envs from becoming build-args durning the build process
  BUILD_ARGS_FILTER: [],
}

/**
 * Builds a config for a container from the images array
 * @function
 * @param {string} container - Name of the container to build the config for
 *
 * @returns {Object} - Built container config
*/
const containerConfig = (container, currentEnv, __internal=noOpObj) => {
  const dockerFile = __internal.dockerPath || path.join(containersPath, container, `Dockerfile`)

  // Merge the container config with the default config and return
  return deepMerge(DEFAULT, {
    VALUES: { file: `-f ${ dockerFile }` },
    // Ensures the Git url for the container gets added as a build arg
    ARGS: keyMap([
      `GIT_${ container.toUpperCase() }_URL`,
      `GIT_APP_URL`,
    ], true),
    // Build the ENVs by merging with the default, context, and environment
    ENV: deepMerge(
      PREFIXED,
      KEG_ENVS,
      __internal.ENVS,
      loadValuesFiles({ container, __internal, env: currentEnv, loadPath: 'env' }),
      loadEnvFiles({ container, __internal, env: currentEnv })
    ),
  })

}

/**
 * Builds the config for each container in the values images array
 * @function
 *
 * @returns {Object} - Built container config
*/
const buildContainers = (container, currentEnv, __internal) => {
  container &&
    !images.includes(container) &&
    images.push(container)

  // Builds the docker locations for the container and Dockerfile
  __CONTAINERS = images.reduce((data, image) => {
    data[ image.toUpperCase() ] = image === container
      ? containerConfig(image, currentEnv, __internal)
      : containerConfig(image, currentEnv)

    return data
  }, {})

  return __CONTAINERS

}

/**
 * Gets the __CONTAINERS object or builds it if it does not exist
 * Finds the default env to ensure the correct env and values files can be loaded
 * @function
 *
 * @returns {Object} - Built container config
*/
const getContainers = () => {
  if(__CONTAINERS) return __CONTAINERS

  const initEnv = checkArgsForEnv() || getDefaultEnv()
  __CONTAINERS = buildContainers(null, initEnv)

  return __CONTAINERS
}

/**
 * Injector helper to build a __CONTAINERS object dynamically
 * @function
 * @param {string} container - Name of the container to inject
 * @param {Object} __internal - Paths to files for the injected container
 *
 * @returns {Object} - Built container config
*/
const injectContainer = (container, currentEnv, __internal) => buildContainers(
  container,
  currentEnv,
  __internal,
)

/**
 * Exported object of this containers module
 * @Object
 */
const containersObj = { injectContainer }

/**
 * Defines the CONTAINERS property on the values object with a get method of getContainers
 * <br/>Allows the getContainers method to dynamically build the __CONTAINERS object at runtime
 * @function
 */
defineProperty(containersObj, 'CONTAINERS', { get: getContainers })

module.exports = deepFreeze(containersObj)
