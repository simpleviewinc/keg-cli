const { addComposeConfigs } = require('./addComposeConfigs')
const { getComposeContextData } = require('./getComposeContextData')
const { get, exists, reduceObj, noOpObj } = require('@keg-hub/jsutils')
const { getImgNameContext } = require('../../getters/getImgNameContext')

/**
 * Mapping of available params to docker-compose arguments
 * @object
 */
const composeArgs = {
  build: {
    clean: '--force-rm',
    cache: '--no-cache',
    nocreate:`--no-recreate`,
    pull: '--pull',
    recreate: '--force-recreate',
  },
  up: {
    abort: '--abort-on-container-exit',
    build: '--build',
    nobuild: '--no-build',
    nocreate:`--no-recreate`,
    recreate: '--force-recreate',
    orphans: '--remove-orphans',
  },
  pull: {
    deps: `--include-deps`,
    log: `--log-level DEBUG`,
  }
}

/**
 * Conditionally adds a docker argument based on the passed in arguments
 * @function
 * @param {string} dockerCmd - Docker command to add the compile file paths to
 * @param {string} toAdd - The arguments to be added to the docker command
 * @param {boolean} condition - If the argument should be added to the dockerCmd
 *
 * @returns {string} - dockerCmd string with the file paths added
 */
const addDockerArg = (dockerCmd, toAdd, condition) => {
  return condition
    ? `${dockerCmd} ${toAdd}`
    : dockerCmd
}

/**
 * Converts the passed in docker-compose params to to string format
 * @function
 * @param {string} dockerCmd - docker-compose command to add params to
 * @param {Object} params - Parse params passed from the command line
 *
 * @returns {string} - docker command with params added
 */
const addCmdOpts = (dockerCmd, cmdArgs, params) => {
  return reduceObj(params, (key, value, added) => {
    const condition = key === 'cache' ? !Boolean(value) : Boolean(value)

    return !cmdArgs[key]
      ? added
      : addDockerArg(
          added,
          cmdArgs[key],
          condition
        )
  }, dockerCmd)
}

/**
 * Build the docker-compose down args to ensure it cleans up properly
 * @function
 * @param {string} dockerCmd - docker-compose command to add params to
 * @param {string} remove - Args passed in from the command line to define what items to remove
 *
 * @returns {string} - Docker compose command, with remove args added
 */
const getDownArgs = (dockerCmd, params) => {
  const { remove } = params

  return remove.split(',').reduce((builtCmd, toRemove) => {
    if(toRemove === 'all' || toRemove === 'local')
      dockerCmd = `${dockerCmd} -rmi ${toRemove}`
    else if(toRemove === 'v' || toRemove === 'volumes')
      dockerCmd = `${dockerCmd} --volumes`
    else if(toRemove === 'or' || toRemove === 'orphans')
      dockerCmd = `${dockerCmd} --remove-orphans`

    return dockerCmd
  }, dockerCmd)
}

/**
 * Creates the docker-compose up command
 * @function
 * @param {Object} globalConfig - Global config object for the keg-cli
 * @param {string} cmdContext - Context the command is being run in ( core | tap )
 * @param {Object} params - Parse params passed from the command line
 *
 * @returns {string} - Built docker command
 */
const buildComposeCmd = async args => {
  const { cmd, params=noOpObj, __internal=noOpObj } = args

  // Get the image name context, so we can pull the image
  const imgNameContext = __internal.imgNameContext || await getImgNameContext(params)

  // Get the compose data for filling out the injected compose template
  // only if the KEG_NO_INJECTED_COMPOSE env does not exist
  const composeData = !exists(get(args, `contextEnvs.KEG_NO_INJECTED_COMPOSE`)) &&
    await getComposeContextData(args, imgNameContext)

  // Find the dynamic compose configs, and add them to the command
  let dockerCmd = await addComposeConfigs(`docker-compose`, args, composeData)

  // We need to set a different log level for the pull command
  // So only add the cmd if it's not pull
  dockerCmd = cmd !== `pull` ? `${dockerCmd} ${cmd}` : dockerCmd

  const cmdArgs = composeArgs[cmd]

  switch(cmd){
    case 'build': {
      dockerCmd = addCmdOpts(dockerCmd, cmdArgs, params)
      break
    }
    case 'up': {
      dockerCmd = addCmdOpts(
        addDockerArg(dockerCmd, '--detach', !Boolean(params.attach)),
        cmdArgs,
        params
      )
      break
    }
    case 'pull': {
      // Add the log level, then add the cmd to allow tracking the pull output
      dockerCmd = `${dockerCmd} ${cmdArgs.log} ${cmd} ${cmdArgs.deps}`
      break
    }
    case 'down': {
      dockerCmd = params.remove ? getDownArgs(dockerCmd, params) : dockerCmd
      break
    }
  }

  return {
    dockerCmd,
    composeData,
    imgNameContext
  }
}

module.exports = {
  buildComposeCmd
}

