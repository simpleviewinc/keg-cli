const path = require('path')
const homeDir = require('os').homedir()
const { deepFreeze } = require('@keg-hub/jsutils')

const { KEG_GLOBAL_CONFIG } = process.env

// The default global config path and config file
let GLOBAL_CONFIG_FOLDER = path.join(homeDir, '.kegConfig')
let GLOBAL_CONFIG_FILE = 'cli.config.json'

// If the global config path is passed in as an ENV, use that instead
if (KEG_GLOBAL_CONFIG) {
  const configPathSplit = KEG_GLOBAL_CONFIG.split('/')
  GLOBAL_CONFIG_FILE = configPathSplit.pop()
  GLOBAL_CONFIG_FOLDER = configPathSplit.join('/')
}

module.exports = deepFreeze({
  // Global config paths
  GLOBAL_CONFIG_FOLDER,
  GLOBAL_CONFIG_FILE,

  // Global config settings
  GLOBAL_CONFIG_PATHS: {
    CLI: 'cli',
    CLI_PATHS: 'cli.paths',
    GIT: 'cli.git',
    TAPS: `cli.taps`,
    TAP_LINKS: `cli.taps`,
  },

  // all supported tap config names
  TAP_CONFIG_NAMES: [
    'tap.config.js',
    'tap.js',
    'tap.config.json',
    'tap.json',
    'app.config.js',
    'app.js',
    'app.config.json',
    'app.json',
    'package.json',
  ]
})
