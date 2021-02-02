const { addComposeConfigs } = require('./addComposeConfigs')
const { get, exists, reduceObj } = require('@keg-hub/jsutils')
const { getComposeContextData } = require('./getComposeContextData')

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
  const { cmd, params={} } = args

  // Get the compose data for filling out the injected compose template
  // only if the KEG_NO_INJECTED_COMPOSE env does not exist
  const composeData = !exists(get(args, `contextEnvs.KEG_NO_INJECTED_COMPOSE`)) &&
    await getComposeContextData(args)

  let dockerCmd = `docker-compose`
  dockerCmd = await addComposeConfigs(dockerCmd, args, composeData)
  dockerCmd = `${dockerCmd} ${cmd}`
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
    }
    case 'pull': {
      dockerCmd = `${dockerCmd} ${cmdArgs.deps}`
      break
    }
    case 'down': {
      dockerCmd = params.remove ? getDownArgs(dockerCmd, params) : dockerCmd
      break
    }
  }

  return { dockerCmd, composeData }
}

module.exports = {
  buildComposeCmd
}

