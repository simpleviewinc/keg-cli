const { deepFreeze } = require('@keg-hub/jsutils')
const cliUtilsConstants = require('KegRepos/cli-utils/src/constants')
const homeDir = require('os').homedir()
const path = require('path')
const { KEG_GLOBAL_CONFIG } = process.env

// Cache the root of the CLI for easy access
const CLI_ROOT = path.join(__dirname, '../../')
const CONFIG_FOLDER_NAME = '.kegConfig'

// The default global config path and config file
let GLOBAL_CONFIG_FOLDER = path.join(homeDir, CONFIG_FOLDER_NAME)
let GLOBAL_CONFIG_FILE = 'cli.config.json'

// If the global config path is passed in as an ENV, use that instead
if (KEG_GLOBAL_CONFIG) {
  const configPathSplit = KEG_GLOBAL_CONFIG.split('/')
  GLOBAL_CONFIG_FILE = configPathSplit.pop()
  GLOBAL_CONFIG_FOLDER = configPathSplit.join('/')
}

let GLOBAL_INJECT_FOLDER = path.join(GLOBAL_CONFIG_FOLDER, '.tmp')

/**
 * Environment keys mapped to their shortcuts
 * @array
 */
const ENV_MAP = {
  PRODUCTION: [ 'production', 'prod', 'p' ],
  CI: [ 'ci', 'c' ],
  QA: [ 'qa', 'q' ],
  STAGING: [ 'staging', 'st', 's' ],
  DEVELOPMENT: [ 'development', 'dev', 'd' ],
  LOCAL: [ 'local', 'loc', 'l' ],
  TEST: [ 'test', 'tst', 't' ]
}

/**
 * All env shortcuts mapped to a single array
 * @array
 */
const ENV_OPTIONS = Object.entries(ENV_MAP)
  .reduce((options, [ main, shortcuts ]) => {
    return options.concat(shortcuts)
  }, [])

module.exports = deepFreeze({
  // include all constants from repos/cli-utils
  UTILS: cliUtilsConstants,

  // Tasks settings
  TASK_REQUIRED: [
    'prefix',
    'name',
    'action',
    'description'
  ],

  CLI_ROOT,
  GLOBAL_CONFIG_FILE,
  GLOBAL_INJECT_FOLDER,
  GLOBAL_CONFIG_FOLDER,

  // Sets the command to open an IDE
  GLOBAL_CONFIG_EDITOR_CMD: 'cli.settings.editorCmd',


  // Keg Default .env file
  DEFAULT_ENV: `defaults.env`,

  // Check if the command should be logged
  // Passed as the last argument to the spawnCmd method
  NO_CMD_LOG: `NO_CMD_LOG`,
  
  // Help options. when one is passed as an option, the help menu is printed
  HELP_ARGS: [
    'help',
    '-help',
    '--help',
    'h',
    '-h',
    '--h',
  ],

  // --- GIT Constants --- //
  // Path to the git ssh key
  GIT_SSH_KEY_PATH: path.join(homeDir, '.ssh/github'),
  GIT_SSH_COMMAND: "ssh",
  GIT_SSH_KEY: '-i {{ GIT_KEY_PATH }}',
  GIT_SSH_PARAMS: [
    '-o BatchMode=yes',
    '-o UserKnownHostsFile=/dev/null',
    '-o StrictHostKeyChecking=no'
  ],

  // Environment keys mapped to their shortcuts 
  ENV_MAP,
  // ALL Environment keys as an array
  ENV_OPTIONS,
  // Shortcuts to map env to real environment
  ENV_ALIAS: [ 'environment', 'env', 'e' ],

  // Keys in the object that should be returned by
  // the buildContainerContext method
  CONTEXT_KEYS: [
    `cmdContext`,
    'contextEnvs',
    `image`,
    'location',
    'tap'
  ],

  SYNC_PREFIXES: {
    BDD_SERVICE: 'bdd',
  },

  // Container context helpers
  // Mapped prefixes for some tasks that add prefixes when running containers
  CONTAINER_PREFIXES: {
    PACKAGE: 'package',
    IMAGE: 'img',
  },

  CONTEXT_TO_CONTAINER: {
    base: 'keg-base',
    core: 'keg-core',
    proxy: 'keg-proxy',
  },

  // Map shortcuts and variations between the container cmdContext and the container
  CONTAINER_TO_CONTEXT: {
    kegbase: 'base',
    'keg-base': 'base',
    kegcore: 'core',
    'keg-core': 'core',
    kegproxy: 'proxy',
    'keg-proxy': 'proxy',
  },

  // docker exec constants and options for the utils/services/composeService.js
  KEG_DOCKER_EXEC: 'KEG_DOCKER_EXEC',
  KEG_EXEC_OPTS: {
    start: 'compose-start',
    packageRun: 'package-run',
    dockerExec: 'docker-exec',
  },

  VERSION: {
    TYPES: [
      'major',
      'minor',
      'patch',
    ]
  },

})
