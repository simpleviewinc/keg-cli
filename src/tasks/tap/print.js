const { getTapConfig, getTapPackage } = require('KegRepos/cli-utils')
const { Logger } = require('KegLog')
const { get, isObj } = require('@keg-hub/jsutils')
const { generalError } = require('KegUtils/error')
const nodePath = require('path')

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
 * Helper for printConfig when it cannot find a config to print
 * @param {string} tap - tap alias
 * @param {string} searchPath - config or package search path
 * @throws {Error}
 */ 
const throwMissingConfigError = (tap, searchPath) => {
  generalError(`
    Could not find object to print with search path "${searchPath}"
    Verify that:
      - Your search path parameter starts with one of: [${configNames.toString()}] or [${packageNames.toString()}] (default='config')
      ${ !tap ? '- Your current path is a linked tap.' : '' }
  `)
}

/**
 * Prints out a tap's config or package.json (see options), using the specified tap or the tap in your current directory  
 * @param {Object} args - arguments passed from the runTask method
 */
const printConfig = args => {
  const { params } = args
  const { tap, path, verbose } = params

  // find tap using these parameters
  const searchParams = { name: tap, path: !tap && process.cwd() }

  const [ fileType, subPath ] = splitPath(path)
  const [ config, foundPath ] = configNames.includes(fileType)
    ? getTapConfig(searchParams)
    : packageNames.includes(fileType)
      ? getTapPackage(searchParams)
      : []

  !config && throwMissingConfigError(tap, path)

  const value = get(config, subPath, config)

  verbose && Logger.success(
    `Found ${nodePath.basename(foundPath)} in "${nodePath.dirname(foundPath)}":`
  )

  Logger.stdout(
    isObj(value)
      ? JSON.stringify(value, null, 2)
      : value
  )
}

module.exports = {
  print: {
    name: 'print',
    action: printConfig,
    description: `Prints out the tap config or package json, using the specified tap or the tap in your current directory`,
    alias: ['prnt', 'prn'],
    example: 'keg tap print config.keg.alias',
    options: {
      path: {
        description: 'Optional path to a value within the config you want to read. Needs to start with either "config" for the tap config or "package" for package.json',
        alias: [ 'path', 'key', 'k' ],
        default: 'config',
        example: 'keg evf print config.expo.slug or keg evf print package'
      },
      tap: {
        description: 'Name of tap. This is automatically set when running through injected tap aliases (e.g. keg evf config)',
        example: 'keg evf prn, or keg tap prn --tap evf',
      },
      verbose: {
        description: 'If true, prints out additional data, like the path to the resolved config',
        example: 'keg evf prn --verbose',
        default: false,
      },
    }
  }
}
