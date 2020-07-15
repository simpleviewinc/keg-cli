const path = require('path')
const { get } = require('@ltipton/jsutils')
const { spawnCmd, executeCmd } = require('KegProc')
const { readDir, pathExists } = require('KegFileSys')
const { generalError, throwTaskFailed } = require('../error')

const containerPathExist = async checkPath => {
  const [ err, rep ] =  await pathExists(checkPath)
  return Boolean(rep)
}

const checkMultiPath = async (mainPath, altPath) => {
  let hasPath = await containerPathExist(mainPath) && mainPath
  hasPath = hasPath || await containerPathExist(altPath) && altPath

  return hasPath
}

const checkComposeFile = async containerPath => {
  const hasComp = await checkMultiPath(
    path.join(containerPath, 'docker-compose.yml'),
    path.join(containerPath, 'docker-compose.yaml')
  )

  return hasComp
}

const checkDockerFile = async (tapPath, containerPath) => {
  const hasDocker = await checkMultiPath(
    path.join(containerPath, 'Dockerfile'),
    path.join(tapPath, 'Dockerfile')
  )

  return hasDocker
}

const checkYmlFile = async (containerPath, fileName) => {
  const hasYml = await checkMultiPath(
    path.join(containerPath, `${ fileName }.yml`),
    path.join(containerPath, `${ fileName }.yaml`)
  )

  return hasYml
}

const missingContainerFile = (tap, tapPath, fileName) => {
  Logger.error(`The tap ${ tap } has a container folder, but it's missing a ${ fileName } file.\n`)
  Logger.highlight(`Ensure the file`, fileName, `Exists at ${ tapPath }!`)

  throwTaskFailed()
}

const injectTapData = async ({ tap, tapPath }, containerPaths) => {
  const { injectImage } = require('KegConst/docker/values')
  const { injectContainer } = require('KegConst/docker/containers')

  injectImage(tap)

  injectContainer(tap, containerPaths)

}

/**
 * Checks if there is a container folder in the tap
 * <br/>Then checks if it has the correct files needed to build tap
 * <br/>If it does, then uses that container folder over the keg-cli default
 * @function
 * @param {Object} tapPath - Local path to the tap
 *
 * @returns {Object} - ENVs for the context, with the KEG_CONTEXT_PATH added if needed
 */
const checkTapContainer = async (tap, tapPath) => {
  const containerPath = path.join(tapPath, 'container')

  // Check if there is a container folder at the tap path
  const hasContainer = await containerPathExist(containerPath)
  // If no container folder, just return
  if(!hasContainer) return

  // Check if there is a Dockerfile at the tapPath or tap container folder
  const dockerPath = await checkDockerFile(tapPath, containerPath)
  !dockerPath && missingContainerFile(tap, containerPath, `Dockerfile`)

  // Check if there is a docker-compose file at in the tap container folder
  const composePath = await checkYmlFile(containerPath, 'docker-compose')
  !composePath && missingContainerFile(tap, containerPath, `docker-compose.yml`)

  // Check if there is a values file at in the tap container folder
  const valuesPath = await checkYmlFile(containerPath, 'values')
  !valuesPath && missingContainerFile(tap, containerPath, `values.yml`)

  return {
    valuesPath,
    dockerPath,
    composePath,
    containerPath,
  }

}

/**
 * Checks a taps local path for a container folder and loads it if it exists
 * <br/>Injects it into the DOCKER IMAGES constants if found
 * @function
 * @param {Object} globalConfig - Global CLI config
 *
 * @returns {Object} - Found task and options
 */
const loadTapContainer = async params => {
  const { globalConfig, tap, tapPath, taskData } = params

  const containerPaths = await checkTapContainer(tap, tapPath)
  if(!containerPaths) return

  await injectTapData(params, containerPaths)


  // task.location_context
  
}

module.exports = {
  loadTapContainer
}