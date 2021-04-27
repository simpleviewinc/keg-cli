const { getTapConfig, getTapPackage } = require('KegUtils/tap/getTapConfig')
const { Logger } = require('KegLog')
const { get } = require('@keg-hub/jsutils')
const { generalError } = require('KegUtils/error')
const path = require('path')

const colorLog = (color, str) => Logger.print(Logger.color(color, str))

/**
 * Prints out a tap's config or package.json (see options)
 * @param {Object} args - arguments passed from the runTask method
 */
const printConfig = args => {
  const { globalConfig, params } = args
  const { tap, package, context, verbose } = params

  !tap && generalError('Cannot print config without a tap parameter.')

  const tapPath = get(globalConfig, `cli.taps.${tap}.path`) 
  const [ config, foundPath ] = !package
    ? getTapConfig(tapPath)
    : getTapPackage(tapPath)

  const value = get(config, context, config)

  verbose && colorLog(
    'green', 
    `Found ${path.basename(foundPath)} in "${path.dirname(foundPath)}":`
  )

  colorLog('blue', JSON.stringify(value, null, 2))
}

module.exports = {
  action: {
    name: 'config',
    action: printConfig,
    description: `Prints out the tap config`,
    options: {
      context: {
        description: 'Optional path to a value within the config you want to read',
        alias: [ 'path', 'p', 'key', 'k' ],
        default: undefined,
        example: 'keg evf config expo.slug'
      },
      tap: {
        description: 'Name of tap. This is automatically set when running through injected tap aliases (e.g. keg evf config)',
        alias: ['t'],
      },
      package: {
        description: 'If true, prints out the tap\'s package.json instead',
        alias: ['pkg', ],
        default: false,
      },
      verbose: {
        description: 'If true, prints out additional data, like the path to the resolved config',
        alias: ['v'],
        default: false,
      },
    }
  }
}
