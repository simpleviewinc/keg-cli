const path = require('path')
const homeDir = require('os').homedir()
const { deepMerge } = require('@keg-hub/jsutils')
const defaultConfig = require('../../../scripts/setup/cli.config')

const cliRoot = path.join(__dirname, '../../../')
const kegHub = process.env.KEG_ROOT_DIR || path.join(homeDir, './keg-hub')
const kegRepos = path.join(kegHub, 'repos')
const kegTaps = path.join(kegHub, 'taps')

module.exports = deepMerge(defaultConfig, {
  version: '1.0.0',
  name: 'keg-cli',
  displayName: 'Keg CLI',
  docker: {
    providerUrl: 'ghcr.io',
    namespace: "simpleviewinc",
    user: 'testuser',
    token: ''
  },
  cli: {
    git: {
      publicToken: '123456789',
      sshKey: path.join(homeDir, '.ssh/github'),
      key: '123456789'
    },
    paths: {
      keg: kegHub,
      hub: kegHub,
      repos: kegRepos,
      taps: kegTaps,
      cli: path.join(kegRepos, 'keg-cli'),
      components: path.join(kegRepos, 'keg-components'),
      containers: path.join(kegRepos, 'keg-cli/containers'),
      core: path.join(kegRepos, 'keg-core'),
      proxy: path.join(kegRepos, 'keg-proxy'),
      resolver: path.join(kegRepos, 'tap-resolver'),
    },
    settings: {
      task: {
        optionsAsk: false
      }
    },
    taps: {
      test: {
        path: path.join(cliRoot, 'src/__mocks__/tap')
      },
    }
  },
  publish: {
    test: {
      name: 'test',
      dependent: true,
      order: {
        0: '@keg-hub/re-theme',
        1: '@keg-hub/keg-components',
        2: '@keg-hub/keg-core'
      }
    }
  }
})
