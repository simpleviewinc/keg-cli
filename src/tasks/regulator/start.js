const { Logger } = require('KegLog')
const { get, checkCall, set, toInt } = require('@ltipton/jsutils')
const { bddService, buildService, serviceOptions } = require('KegUtils/services')
const { throwRequired } = require('KegUtils/error/throwRequired')
const { DOCKER: { CONTAINERS_PATH } } = require('KegConst/docker')
const { copyBddRun } = require('KegUtils/helpers/copyBddRun')

/**
 * Call method to throw an error when the context or location option is missing
 * @param {Object} task - The current task being run
 *
 * @returns {void}
 */
const throwMissingParams = task => {
  throwRequired(task, 'context', get(task, 'options.context'), true)
  Logger.yellow(`\n  - OR -`)
  throwRequired(task, 'location', get(task, 'options.location'))
}

/**
 * Pulls out the option params that should be passed in as envs to the container
 * @param {Object} params - Parsed options object passed from the cmd line
 *
 * @returns {Object} - Params converted into an ENVs object
 */
const extractEnvsFromParams = ({ headless, height, width, ...params }) => {
  const parsedHeight = toInt(height)
  const parsedWidth = toInt(width)

  return { params, envs: {
    ...(parsedWidth && { WINDOW_WIDTH: parsedWidth }),
    ...(parsedHeight && { WINDOW_HEIGHT: parsedHeight }),
    ...(!headless && { HEADLESS: "false", SELENIUM_VNC: '-debug' }),
  }}

}

/**
 * Finds the correct service to be run and returns it
 * @param {string} service - Name of the service to be run
 *
 * @returns {function} - Service function to run
 */
const getService = service => {
  // NOTES: If needed, add logic for other types of services run through the regulator repo
  // For now, only service available is bdd
  return service === 'bdd'
    ? bddService
    : bddService
}

/**
 * Runs keg-regulators in a docker container
 * @param {Object} args - arguments passed from the runTask method
 * @param {string} args.command - Initial command being run
 * @param {Array} args.options - arguments passed from the command line
 * @param {Object} args.tasks - All registered tasks of the CLI
 * @param {Object} globalConfig - Global config object for the keg-cli
 *
 * @returns {void}
 */
const start = async args => {
  // Ensure a context or location was passed
  const { params: { context, location, build }, task } = args
  !context && !location && throwMissingParams(task)

  // Copy the run.sh file from the keg-cli/containers/regulator repo
  await copyBddRun()

  // Call the build service to ensure required images are built
  const isBuilt = await buildService(args, { context: 'regulator', image: 'keg-regulator' })

  // Update the build param so we don't rebuild the tap
  build && set(args, 'params.build', !isBuilt) 

  // Pull out any params that should be passed on as envs
  const { envs, params } = extractEnvsFromParams(args.params)

  return checkCall(
    getService(get(args, 'params.service', 'bdd')),
    { ...args, envs, params },
    { context: 'regulator', container: 'keg-regulator', cmd: `sh run.sh` },
  )
}

module.exports = {
  start: {
    name: 'start',
    action: start,
    alias: [ 'st' ],
    description: `Runs keg-regulators in a docker container`,
    example: 'keg test start <options>',
    options: serviceOptions('regulator', 'start', {
      context: {
        description: 'Context or name of the repo to run the regulator tests on',
        example: 'keg regulator start --context core',
        enforce: true,
      },
      height: {
        alias: [ 'ht' ],
        description: "Height of the browser when not running in headless mode",
        example: 'keg regulator start --headless false --height <amount>',
      },
      headless: {
        alias: [ 'hdl', 'hl' ],
        description: "Run the tests in a headless browser",
        example: 'keg regulator start --headless false',
        default: true,
      },
      location: {
        description: "Local path to the folder containing the features and steps",
        example: 'keg regulator start --location path/to/my/tests',
        enforce: true,
      },
      local: {
        description: 'Copy the local repo into the docker container at build time',
        example: `keg regulator start --local`,
        default: false,
      },
      service: {
        description: 'Regulator service to run.',
        example: 'keg regulator start --service bdd',
        default: 'bdd',
      },
      tap: {
        description: 'Name of the tap to mount into keg-regulator container. Only needed if "context" argument is "tap"',
        example: `keg regulator start --context tap --tap events-force`,
      },
      width: {
        alias: [ 'wd' ],
        description: "Width of the browser when not running in headless mode",
        example: 'keg regulator start --headless false --width <amount>',
      },
    }),
  }
}