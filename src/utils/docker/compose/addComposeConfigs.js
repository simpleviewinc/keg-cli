const path = require('path')
const { Logger } = require('KegLog')
const { get } = require('@keg-hub/jsutils')
const { loadTemplate } = require('KegUtils/template')
const { getContainerConst } = require('../getContainerConst')
const { GLOBAL_INJECT_FOLDER } = require('KegConst/constants')
const { generalError } = require('KegUtils/error/generalError')
const { writeFile, mkDir, pathExists } = require('KegFileSys')

/**
 * Writes the injected compose file to the global injected folder
 * @function
 * @param {string} injectedCompose - Path to the injected-compose.yml file
 * @param {Object} data - Data to fill the compose template with
 *
 * @returns {boolean} - If the file was added
 */
const writeInjectedCompose = async (injectedCompose, data) => {
  await mkDir(GLOBAL_INJECT_FOLDER)

  const template = await loadTemplate('injected-compose', data)
  const [ err, saved ] = await writeFile(injectedCompose, template)

  err && generalError(`ERROR: Can not write injected compose file.\n${ err.stack }`)

  return saved
}

/**
 * Adds the injected-compose.template.yml file
 * @function
 * @param {string} data - Data to fill the template with
 *
 * @returns {string} - Filled docker-compose.yml template file
 */
const addInjectedTemplate = async (dockerCmd, data={}, composeData) => {

  // Build the path of the injected compose file, based on the proxyDomain ( app name + git branch name )
  const injectedCompose = path.join(
    GLOBAL_INJECT_FOLDER,
    `${composeData.proxyDomain || composeData.service}.yml`
  )

  const dockCmdWithCompose = `${dockerCmd} -f ${injectedCompose}`

  // Check if it already exists, and if it does, then just return
  // Don't auto remove the inject compose file
  const [ err, exists ] = await pathExists(injectedCompose)
  if(exists) return dockCmdWithCompose

  if(!composeData || !composeData.service || !composeData.imageFrom){
    Logger.warn(
      `Injected compose failed!`,
      `Missing one of image or imageFrom in composeData object.`,
      composeData
    )

    return dockerCmd
  }

  // Join the composeData and the generated labels together, and write the injected compose file
  await writeInjectedCompose(injectedCompose, {
    ...composeData,
    generatedLabels: ''
  })

  return dockCmdWithCompose
}

/**
 * Builds a docker-compose file argument based on the passed in args
 * @function
 * @param {string} dockerCmd - Docker command to add the compile file paths to
 * @param {string} context - Context the docker command is being run in ( core / tap )
 * @param {string} env - Name of the ENV that defines the file path of the compose file
 * @param {string} composeFile - compose file path to override pulling from container ENVs
 *
 * @returns {string} - dockerCmd string with the file path added
 */
const addComposeFile = (dockerCmd='', container, env, composeFile) => {
  const compPath = composeFile || getContainerConst(container, `ENV.${ env }`)
  const addedComposeFile = compPath ? `-f ${ compPath }` : ''

  return `${dockerCmd} ${ addedComposeFile }`.trim()
}

/**
 * Adds the paths to the docker compose file for the env
 * @function
 * @param {string} dockerCmd - Docker command to add the compile file paths to
 * @param {Object} args - Arguments passed on from the current Task
 * @param {string} args.cmdContext - Current docker image context
 * @param {Object} args.params - Parse options passed from the cmd line
 * @param {Object} args.globalConfig - CLI Global Config object
 * @param {Object} args.contextEnvs - ENVs for the current context
 * 
 *
 * @returns {string} - dockerCmd string with the file paths added
 */
const addComposeConfigs = async (cmd, args, composeData) => {
  let dockerCmd = cmd

  const curENV = get(args, `params.env`, 'development')
  const container = get(args, 'cmdContext', '').toUpperCase()

  if(!container) return dockerCmd

  // Check if we should add the injected docker-compose file
  // Add it first, so other compose files can override the injected one as needed
  dockerCmd = composeData
    ? await addInjectedTemplate(dockerCmd, args, composeData)
    : dockerCmd

  const injectedComposePath = get(args, 'params.__injected.composePath')

  // Check if the compose file path has been injected
  // Or get the default docker compose file
  dockerCmd = injectedComposePath
    ? addComposeFile(dockerCmd, container, ``, injectedComposePath)
    : addComposeFile(dockerCmd, container, `KEG_COMPOSE_DEFAULT`)

  // Loop over the possible docker-compose path envs
  // For each one, check if a docker-compose config file exists at that path 
  // If it does, add it to the dockerCmd
  dockerCmd = ([
    // Get the docker compose file from the repo
    `KEG_COMPOSE_REPO`,
    // Get the docker compose file for the environment
    `KEG_COMPOSE_${ curENV }`,
    // Get the docker compose file for the container
    `KEG_COMPOSE_${ container }`,
    // Get the docker compose file for the container and ENV
    `KEG_COMPOSE_${ container }_${ curENV }`
  ]).reduce((cmdWCompose, env) => {
    return addComposeFile(cmdWCompose, container, env.toUpperCase())
  }, dockerCmd)

  return dockerCmd
}


module.exports = {
  addComposeConfigs
}