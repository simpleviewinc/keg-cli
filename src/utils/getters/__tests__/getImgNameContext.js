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

const { getImgNameContext } = require('../getImgNameContext')

const testArgs = {
  fullUrl: {
    description: 'It should return the imageName context from just an image url',
    inputs: [{ image: `ghcr.io/test-org/test-path/test-app:test-tag` }],
    outputs: {
      image: 'test-app',
      provider: 'ghcr.io',
      namespace: 'test-org/test-path',
      tag: 'test-tag',
      imageWTag: 'test-app:test-tag',
      full: 'ghcr.io/test-org/test-path/test-app:test-tag',
      providerImage: 'ghcr.io/test-org/test-path/test-app',
    }
  },
  imgName: {
    description: 'It should return the imageName context with only an image name',
    inputs: [{ image: 'keg-core' }],
    outputs: {
      image: 'keg-core',
      provider: 'ghcr.io',
      namespace: 'simpleviewinc',
      tag: 'develop',
      imageWTag: 'keg-core:develop',
      full: 'ghcr.io/simpleviewinc/keg-core:develop',
      providerImage: 'ghcr.io/simpleviewinc/keg-core',
    }
  },
  imgTag: {
    description: 'It should return the imageName context with a custom tag and context',
    inputs: [{ context: 'injected', tag: 'test-tag' }],
    outputs: {
      image: 'tap-injected-test',
      provider: 'ghcr.io',
      namespace: 'simpleviewinc',
      tag: 'test-tag',
      imageWTag: 'tap-injected-test:test-tag',
      full: 'ghcr.io/simpleviewinc/tap-injected-test:test-tag',
      providerImage: 'ghcr.io/simpleviewinc/tap-injected-test',
    }
  },
  context: {
    description: 'It should return the imageName context with only a context',
    inputs: [{ context: 'components', tap: 'components' }],
    outputs: {
      image: 'components',
      tag: 'develop',
      provider: 'ghcr.io',
      namespace: 'simpleviewinc',
      imageWTag: 'components:develop',
      full: 'ghcr.io/simpleviewinc/components:develop',
      providerImage: 'ghcr.io/simpleviewinc/components',
    }
  },
  injected: {
    description: 'It should return the imageName context for injected apps',
    inputs: [{ context: 'injected', tap: 'injected' }],
    outputs: {
      image: 'tap-injected-test',
      tag: 'develop',
      provider: 'ghcr.io',
      namespace: 'simpleviewinc',
      imageWTag: 'tap-injected-test:develop',
      full: 'ghcr.io/simpleviewinc/tap-injected-test:develop',
      providerImage: 'ghcr.io/simpleviewinc/tap-injected-test',
    }
  },
  tagOverride: {
    description: 'It should override the image tag',
    inputs: [{ context: 'components', tap: 'components', tag: 'test-tag' }],
    outputs: {
      image: 'components',
      tag: 'test-tag',
      provider: 'ghcr.io',
      namespace: 'simpleviewinc',
      imageWTag: 'components:test-tag',
      full: 'ghcr.io/simpleviewinc/components:test-tag',
      providerImage: 'ghcr.io/simpleviewinc/components',
    }
  },
  providerOverride: {
    description: 'It should override the docker provider',
    inputs: [{ context: 'core', provider: 'my.test-provider.com' }],
    outputs: {
      image: 'keg-core',
      tag: 'develop',
      provider: 'my.test-provider.com',
      namespace: 'simpleviewinc',
      imageWTag: 'keg-core:develop',
      full: 'my.test-provider.com/simpleviewinc/keg-core:develop',
      providerImage: 'my.test-provider.com/simpleviewinc/keg-core',
    }
  },
  namespaceOverride: {
    description: 'It should override the url namespace',
    inputs: [{ context: 'components', tap: 'components', namespace: 'test-namespace' }],
    outputs: {
      image: 'components',
      tag: 'develop',
      provider: 'ghcr.io',
      namespace: 'test-namespace',
      imageWTag: 'components:develop',
      full: 'ghcr.io/test-namespace/components:develop',
      providerImage: 'ghcr.io/test-namespace/components',
    }
  },
  fromOnly: {
    description: 'It should work with only the from param',
    inputs: [{ from: `provider/namespace/keg-items:test` }],
    outputs: {
      image: 'keg-items',
      provider: 'provider',
      namespace: 'namespace',
      tag: 'test',
      imageWTag: 'keg-items:test',
      full: 'provider/namespace/keg-items:test',
      providerImage: 'provider/namespace/keg-items'
    }
  },
  fromOverride: {
    description: 'It use the from param over other params',
    inputs: [{ context: 'components', tap: 'components', tag: 'master', from: `provider/namespace/keg-items:test` }],
    outputs: {
      image: 'keg-items',
      provider: 'provider',
      namespace: 'namespace',
      tag: 'test',
      imageWTag: 'keg-items:test',
      full: 'provider/namespace/keg-items:test',
      providerImage: 'provider/namespace/keg-items'
    }
  },
  fromWithProviderNamespace: {
    description: 'It use the from param over other params',
    inputs: [{ provider: 'not-used', namespace: 'not-used', from: `provider/namespace/keg-items:test` }],
    outputs: {
      image: 'keg-items',
      provider: 'provider',
      namespace: 'namespace',
      tag: 'test',
      imageWTag: 'keg-items:test',
      full: 'provider/namespace/keg-items:test',
      providerImage: 'provider/namespace/keg-items'
    }
  },
  fromNoProviderNamespace: {
    description: 'It use the from param over other params',
    inputs: [{ provider: 'used-provider', namespace: 'used-namespace', from: `keg-items:test` }],
    outputs: {
      image: 'keg-items',
      provider: 'used-provider',
      namespace: 'used-namespace',
      tag: 'test',
      imageWTag: 'keg-items:test',
      full: 'used-provider/used-namespace/keg-items:test',
      providerImage: 'used-provider/used-namespace/keg-items'
    }
  },
  fromImageAndTag: {
    description: 'It should work when from is only an image and tag',
    inputs: [{ from: `keg-items:test` }],
    outputs: {
      image: 'keg-items',
      tag: 'test',
      provider: 'ghcr.io',
      namespace: 'simpleviewinc',
      imageWTag: 'keg-items:test',
      full: 'ghcr.io/simpleviewinc/keg-items:test',
      providerImage: 'ghcr.io/simpleviewinc/keg-items'
    }
  },
  fromOnlyImage: {
    description: 'It should work when from is only an image name',
    inputs: [{ from: `keg-items` }],
    outputs: {
      image: 'keg-items',
      tag: 'develop',
      provider: 'ghcr.io',
      namespace: 'simpleviewinc',
      imageWTag: 'keg-items:develop',
      full: 'ghcr.io/simpleviewinc/keg-items:develop',
      providerImage: 'ghcr.io/simpleviewinc/keg-items'
    }
  },
  imageId: {
    description: 'It should allow passing in an image id',
    inputs: [{ image: 'b80dcb1cac10' }],
    outputs: {
      image: 'keg-core',
      tag: '0.0.1',
      provider: 'ghcr.io',
      namespace: 'simpleviewinc',
      imageWTag: 'keg-core:0.0.1',
      full: 'ghcr.io/simpleviewinc/keg-core:0.0.1',
      providerImage: 'ghcr.io/simpleviewinc/keg-core',
    }
  },
  contextId: {
    description: 'It should allow passing in an image id as the context',
    inputs: [{ context: 'b80dcb1cac10', tag: 'develop' }],
    outputs: {
      image: 'keg-core',
      tag: 'develop',
      provider: 'ghcr.io',
      namespace: 'simpleviewinc',
      imageWTag: 'keg-core:develop',
      full: 'ghcr.io/simpleviewinc/keg-core:develop',
      providerImage: 'ghcr.io/simpleviewinc/keg-core',
    }
  },
  contextIdOverride: {
    description: 'It should allow passing in an id as the context and override with inputs ',
    inputs: [{ context: 'b80dcb1cac10', provider: 'test-provider', namespace: 'test-namespace' }],
    outputs: {
      image: 'keg-core',
      tag: '0.0.1',
      provider: 'test-provider',
      namespace: 'test-namespace',
      imageWTag: 'keg-core:0.0.1',
      full: 'test-provider/test-namespace/keg-core:0.0.1',
      providerImage: 'test-provider/test-namespace/keg-core'
    }
  }
}

describe('getImgNameContext', () => {

  afterAll(() => jest.resetAllMocks())

  testEnum(testArgs, getImgNameContext)

})