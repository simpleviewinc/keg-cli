const path = require('path')
const { Logger } = require('KegLog')
const { get, deepMerge } = require('@keg-hub/jsutils')
const { generalError } = require('KegUtils/error/generalError')
const { runInternalTask } = require('KegUtils/task/runInternalTask')
const { fileSys, constants, resolveFullPath } = require('KegCliUtils')

const { mkDir, pathExistsSync } = fileSys
const { GLOBAL_CONFIG_PATHS: { CLI_PATHS } } = constants

/**
 * Finds the path where the tap should be generated, and creates a folder
 * @param {Object} globalConfig - Global config object for the keg-cli
 * @param {Object} task - Current task being run
 * @param {string} location - Location where the tap should be generated
 *
 * @returns {void}
 */
const generateTapFolder = async (globalConfig, task, location, name) => {
  const foundLoc = get(task, ['options', 'location', 'default']) === location
    ? get(globalConfig, `${ CLI_PATHS }.taps`)
    : location

  const resolved = resolveFullPath(path.join(foundLoc, name))

  pathExistsSync(resolved) &&
    generalError(`Can not create tap. Folder already exists => ${resolved}`)

  Logger.pair(`Creating ${name} folder at`, resolved)
  const [ errMake, madeDir ] = await mkDir(resolved)

  return errMake ? generalError(errMake) : resolved
}

const linkTapFolder = async (args, name, location) => {
  return await runInternalTask('tasks.tap.tasks.link', deepMerge(args, {
      command: 'link',
      params: {
        location,
        name: name.startsWith('tap-') ? name.replace('tap-', '') : name,
      }
    })
  )
}

/**
 * 
 * @param {Object} args - arguments passed from the runTask method
 * @param {string} args.command - Initial command being run
 * @param {Array} args.options - arguments passed from the command line
 * @param {Object} args.tasks - All registered tasks of the CLI
 * @param {Object} globalConfig - Global config object for the keg-cli
 *
 * @returns {void}
 */
const generateTap = async args => {
  const { params, globalConfig, task } = args
  const { alias, name, location } = params

  // Create the tap folder
  const tapLoc = await generateTapFolder(globalConfig, task, location, name)

  // TODO: create the tap.json file in the tap folder

  // Link the tap to the keg-cli
  await linkTapFolder(args, alias || name, tapLoc)

  // TODO: Generate scaffolding

}


module.exports = {
  alias: [ 't' ],
  name: 'tap',
  action: generateTap,
  description: `Generates scaffolding for a new Tap!`,
  example: 'keg generate tap <options>',
  options: {
    name: {
      alias: [ 'context' ],
      description: 'Name of the tap to generate',
      example: 'keg generate tap --context my-tap',
      required: true
    },
    alias: {
      description: 'Keg-CLI alias used to reference the tap. Uses "name" option when not set',
      example: 'keg generate tap --alias mytap',
    },
    location: {
      alias: [ 'path', 'loc' ],
      description: `Location or path where the tap will be generated. Example => /Users/developer/taps/my-tap`,
      default: 'keg-hub/taps/<tap-name>',
    },
  }
}