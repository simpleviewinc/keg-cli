const { deepFreeze } = require('@keg-hub/jsutils')

module.exports = deepFreeze({
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
