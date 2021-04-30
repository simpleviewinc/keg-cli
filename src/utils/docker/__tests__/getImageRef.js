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
      tag: 'develop',
      provider: 'ghcr.io',
      namespace: 'simpleviewinc',
      imageWTag: 'keg-base:develop',
      full: 'ghcr.io/simpleviewinc/keg-base:develop',
      providerImage: 'ghcr.io/simpleviewinc/keg-base',
    },
    outputs: {
      imgRef: dockerData.images.base,
      refFrom: 'keg-base:develop'
    }
  },
  Core: {
    description: 'Should return the image reference for the keg-core image',
    inputs: {
      image: 'keg-core',
      provider: 'ghcr.io',
      namespace: 'simpleviewinc',
      tag: 'develop',
      imageWTag: 'keg-core:develop',
      full: 'ghcr.io/simpleviewinc/keg-core:develop',
      providerImage: 'ghcr.io/simpleviewinc/keg-core',
    },
    outputs: {
      imgRef: dockerData.images.core,
      refFrom: 'keg-core:develop'
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
      tag: 'develop',
      imageWTag: 'tap-injected-test:develop',
      full: 'ghcr.io/simpleviewinc/tap-injected-test:develop',
      providerImage: 'ghcr.io/simpleviewinc/tap-injected-test',
    },
    outputs: {
      imgRef: dockerData.images.injected,
      refFrom: 'ghcr.io/simpleviewinc/tap-injected-test:develop'
    }
  },
}

describe('getImageRef', () => {

  afterAll(() => jest.resetAllMocks())

  testEnum(testArgs, getImageRef)

})