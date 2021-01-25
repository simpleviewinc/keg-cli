const { injectedTest, injectedContainer } = require('KegMocks/injected/injectedTest')
const { docker, dockerData } = require('KegMocks/libs/docker')
const { testEnum } = require('KegMocks/jest/testEnum')

const globalConfig = global.getGlobalCliConfig()
jest.setMock('../../globalConfig/globalConfigCache', {
  __getGlobalConfig: jest.fn(() => globalConfig)
})

const { DOCKER } = require('KegConst/docker')
const withInjected = {
  ...DOCKER.CONTAINERS,
  INJECTED: injectedContainer
}
jest.setMock('KegConst/docker', { DOCKER: { ...DOCKER, CONTAINERS: withInjected }})
jest.setMock('KegDocCli', docker)


const { getImageRef } = require('../getImageRef')

const testArgs = {
  Base: {
    description: 'Should return the image reference for the keg-base image',
    inputs: {
      image: 'keg-base',
      tag: 'master',
      provider: 'ghcr.io',
      namespace: 'simpleviewinc',
      imageWTag: 'keg-base:master',
      full: 'ghcr.io/simpleviewinc/keg-base:master',
      providerImage: 'ghcr.io/simpleviewinc/keg-base',
    },
    outputs: {
      imgRef: dockerData.images.base,
      refFrom: 'keg-base:master'
    }
  },
  Core: {
    description: 'Should return the image reference for the keg-core image',
    inputs: {
      image: 'keg-core',
      provider: 'ghcr.io',
      namespace: 'simpleviewinc',
      tag: 'master',
      imageWTag: 'keg-core:master',
      full: 'ghcr.io/simpleviewinc/keg-core:master',
      providerImage: 'ghcr.io/simpleviewinc/keg-core',
    },
    outputs: {
      imgRef: dockerData.images.core,
      refFrom: 'keg-core:master'
    }
  },
  Tap: {
    description: 'Should return the image reference for the tap image',
    inputs: {
      image: 'tap',
      provider: 'ghcr.io',
      namespace: 'simpleviewinc',
      tag: 'zen-371-booking-button-states',
      imageWTag: 'tap:zen-371-booking-button-states',
      full: 'ghcr.io/simpleviewinc/tap:zen-371-booking-button-states',
      providerImage: 'ghcr.io/simpleviewinc/tap',
    },
    outputs: {
      imgRef: dockerData.images.tap,
      refFrom: 'ghcr.io/simpleviewinc/tap:zen-371-booking-button-states'
    }
  },
  Injected: {
    description: 'Should return the image reference for an injected tap image',
    inputs: {
      image: 'tap-injected-test',
      provider: 'ghcr.io',
      namespace: 'simpleviewinc',
      tag: 'master',
      imageWTag: 'tap-injected-test:master',
      full: 'ghcr.io/simpleviewinc/tap-injected-test:master',
      providerImage: 'ghcr.io/simpleviewinc/tap-injected-test',
    },
    outputs: {
      imgRef: dockerData.images.injected,
      refFrom: 'ghcr.io/simpleviewinc/tap-injected-test:master'
    }
  },
  Components: {
    description: 'Should return the image reference for the keg-components image',
    inputs: {
      image: 'keg-components',
      tag: 'master',
      provider: 'ghcr.io',
      namespace: 'simpleviewinc',
      imageWTag: 'keg-components:master',
      full: 'ghcr.io/simpleviewinc/keg-components:master',
      providerImage: 'ghcr.io/simpleviewinc/keg-components',
    },
    outputs: {
      imgRef: dockerData.images.components,
      refFrom: 'keg-components:master'
    }
  },
}

describe('getImageRef', () => {

  afterAll(() => jest.resetAllMocks())

  testEnum(testArgs, getImageRef)

})