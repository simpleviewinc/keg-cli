const { getTapConfig, getTapPackage } = require('KegRepos/cli-utils')
const { Logger } = require('KegLog')
const { get } = require('@keg-hub/jsutils')
const { generalError } = require('KegUtils/error')
const nodePath = require('path')

const colorLog = (color, str) => Logger.print(Logger.color(color, str))

/**
 * Helper that splits the full path into parts: fileType and subPath
 * @param {string} fullPath 
 * @returns {Array}
 * @example 
 * splitPath('config.foo.bar') => ['config', 'foo.bar']
 */
const splitPath = fullPath => {
  const split = fullPath.split('.')
  return [
    split[0],
    split.slice(1).join('.')
  ]
}

// accepted names for the tap config
const configNames = [ 'config', 'cfg', 'c' ]

// accepted names for the package.json
const packageNames = [ 'package', 'pkg', 'p']

/**
 * Prints out a tap's config or package.json (see options)
 * @param {Object} args - arguments passed from the runTask method
 */
const printConfig = args => {
  const { params } = args
  const { tap, path, verbose } = params

  !tap && generalError('Cannot print config without a tap parameter.')

  const [ fileType, subPath ] = splitPath(path)
  const [ config, foundPath ] = configNames.includes(fileType)
    ? getTapConfig({ name: tap })
    : packageNames.includes(fileType)
      ? getTapPackage({ name: tap })
      : []

  !config && 
    generalError(`
      Could not find object to print from path "${path}". 
      Expected path to start with one of: [${configNames.toString()}] or [${packageNames.toString()}]
    `)

  const value = get(config, subPath, config)

  verbose && Logger.success(
    `Found ${nodePath.basename(foundPath)} in "${nodePath.dirname(foundPath)}":`
  )

  colorLog('blue', JSON.stringify(value, null, 2))
}

module.exports = {
  action: {
    name: 'print',
    action: printConfig,
    description: `Prints out the tap config or package json`,
    alias: ['prnt', 'prn'],
    options: {
      path: {
        description: 'Optional path to a value within the config you want to read. Needs to start with either "config" for the tap config or "package" for package.json',
        alias: [ 'path', 'p', 'key', 'k' ],
        default: 'config',
        example: 'keg evf print config.expo.slug or keg evf print package'
      },
      tap: {
        description: 'Name of tap. This is automatically set when running through injected tap aliases (e.g. keg evf config)',
        example: 'keg evf prn, or keg tap prn --tap evf',
        alias: ['t'],
      },
      verbose: {
        description: 'If true, prints out additional data, like the path to the resolved config',
        alias: ['v'],
        example: 'keg evf prn --verbose',
        default: false,
      },
    }
  }
}
