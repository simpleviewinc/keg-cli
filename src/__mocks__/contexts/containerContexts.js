const path = require('path')
const { DOCKER } = require('KegConst/docker')
const kegHubRoot = path.join(__dirname, '../../../../../')

const containerContexts = {
  base: {
    cmdContext: 'base',
    context: 'base',
    tap: 'base',
    noPrefix: 'base',
    cmdContext: 'base',
    image: 'keg-base',
    withPrefix: 'keg-base',
    location: `${kegHubRoot}/repos/keg-cli`,
    contextEnvs: {
      ...DOCKER.CONTAINERS.BASE.ENV,
    },
  },
  core: {
    context: 'core',
    tap: 'core',
    noPrefix: 'core',
    cmdContext: 'core',
    image: 'keg-core',
    withPrefix: 'keg-core',
    location: `${kegHubRoot}/repos/keg-core`,
    contextEnvs: {
      ...DOCKER.CONTAINERS.CORE.ENV,
    },
  },
  tap: {
    context: 'tap',
    tap: 'tap-test',
    noPrefix: 'tap',
    cmdContext: 'tap',
    image: 'tap',
    withPrefix: undefined,
    location: `${kegHubRoot}/taps/tap-test`,
    contextEnvs: {
      ...DOCKER.CONTAINERS.TAP.ENV,
    },
  }
}


module.exports = {
  containerContexts
}