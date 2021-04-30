const { deepFreeze } = require('@keg-hub/jsutils')

module.exports = deepFreeze({
  PATTERNS: {
    NEWLINES_MATCH: /\n|\r|\r\n/,
    WHITESPACE_MATCH: /[\s]+/,
  },
  CLI_CONFIG_GIT: 'cli.git',
})