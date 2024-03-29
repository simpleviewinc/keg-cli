const path = require('path')
const { yml, env:envLoader } = require('KegPConf')
const { get, deepMerge } = require('@keg-hub/jsutils')
const { GLOBAL_CONFIG_FOLDER } = require('../constants')
const { cliRootDir, containersPath } = require('./values')
const { getRepoPath } = require('KegUtils/getters/getRepoPath')
const { getSetting } = require('KegUtils/globalConfig/getSetting')

/*
 * Adds extra data to the object passed to the template fill function
 * <br/>Used when filling the values.yml || .env files
 * @function
 * @param {string} container - Name of the container to build the config for
 *
 * @returns {Object} - Loaded ENVs for the current environment
*/
const buildExtraData = ({ container, env, __internal={} }) => {
  const { injectPath, context, ...internal } = __internal

  return {
    container,
    containersPath,
    cliPath: cliRootDir,
    context: context || container,
    env: env || getSetting('defaultEnv'),
    globalConfigPath: GLOBAL_CONFIG_FOLDER,
    ...internal,
    contextPath: injectPath || getRepoPath(context || container)
  }
}


/*
 * Checks if an ENV file exists for the current env and loads it
 * @function
 * @param {string} container - Name of the container to build the config for
 *
 * @returns {Object} - Loaded ENVs for the current environment
*/
const loadEnvFiles = args => {
  const { container, env, __internal={} } = args

  const extraData = buildExtraData(args)

  const envPaths = [
    // ENVs in the container folder based on current environment
    // Example => /containers/core/local.env
    path.join(containersPath, container, `${ env }.env`),
    // ENVs in the global config folder based on current environment
    // Example => ~/.kegConfig/local.env
    path.join(GLOBAL_CONFIG_FOLDER, `${ env }.env`),
    // ENVs in the global config folder based on current container
    // Example => ~/.kegConfig/core.env
    path.join(GLOBAL_CONFIG_FOLDER, `${ container }.env`),
    // ENVs in the global config folder based on current container and environment
    // Example => ~/.kegConfig/core-local.env
    path.join(GLOBAL_CONFIG_FOLDER, `${ container }-${ env }.env`),
  ]

  // If an internal ENV path is passed in, add it to the paths array
  const { envsPath } = __internal
  envsPath && envPaths.push(envsPath)

  // Try to load each of the envPaths if then exists
  // Then merge and return them
  return deepMerge(
    ...envPaths.reduce((envs, location) => {
      envs.push(envLoader.loadSync({ location, data: extraData, error: false }))
      return envs
    }, [])
  )

}

/*
 * Builds two paths one with _ and the other with -
 * @function
 * @param {string} rootPath - Root path of the values file
 * @param {string} container - Name of the container to build the config for
 * @param {string} env - Current environment the cli is running in
 *
 * @returns {Object} - Loaded yaml envs for the current environment
*/
const buildValueDup = (rootPath, env, container) => {
  return !env
    ? []
    : container
      ? [
          path.join(rootPath, `${ container }.yml`),
          path.join(rootPath, `values_${ container }.yml`),
          path.join(rootPath, `values-${ container }.yml`),
          path.join(rootPath, `values_${ container }_${ env }.yml`),
          path.join(rootPath, `values-${ container }-${ env }.yml`),
        ]
      : [
          path.join(rootPath, `values_${ env }.yml`),
          path.join(rootPath, `values-${ env }.yml`),
        ]
}

/*
 * Checks if a yml file exists for the current env and loads it's env values
 * @function
 * @param {string} container - Name of the container to build the config for
 * @param {string} env - Current environment the cli is running in
 * @param {Object} __internal - Internal cli object containing injected paths
 * @param {string} loadPath - Path within the Values file to load content from
 *
 * @returns {Object} - Loaded yaml file content
*/
const loadValuesFiles = args => {
  const { container, env, __internal={}, loadPath } = args
  const { valuesPath, containerPath } = __internal

  const extraData = buildExtraData(args)

  const globalPaths = [
    // ENVs in the global config folder based on current environment
    // Example => ~/.kegConfig/values_local.yml
    ...buildValueDup(GLOBAL_CONFIG_FOLDER, env),

    // ENVs in the global config folder based on current container and environment
    // Example => ~/.kegConfig/values_core_local.yml
    ...buildValueDup(GLOBAL_CONFIG_FOLDER, env, container),
  ]

  // If it's an injected app, load the injected values files
  // Otherwise load the internal values paths
  const ymlPaths = containerPath
  ? [
      // Load the global values before the external values
      // This allows apps to overwrite global defaults
      ...globalPaths,
      // Add the main injected values path first
      valuesPath,
      // Also try to load an injected ENV values file that override the default
      ...buildValueDup(containerPath, env),
    ]
  : [
      // ENVs in the container folder based on current environment
      // Example => /containers/core/values.yml
      path.join(containersPath, container, 'values.yml'),
      // ENVs in the container folder based on current environment
      // Example => /containers/core/values_local.yml
      ...buildValueDup(path.join(containersPath, container), env),
      // Load the global values after the internal values
      // This allows global defaults to overwrite internal values
      ...globalPaths,
    ]

  // Try to load each of the envPaths if it exists, then merge and return them
  return deepMerge(
    ...ymlPaths.reduce((ymls, ymlPath) => {
      const loadedYml = ymlPath &&
        yml.loadSync({
          error: false,
          data: extraData,
          location: ymlPath,
        })

      loadedYml &&
        ymls.push(loadPath ? get(loadedYml, loadPath) : loadedYml)

      return ymls
    }, [])
  )

}



module.exports = {
  loadEnvFiles,
  loadValuesFiles
}
