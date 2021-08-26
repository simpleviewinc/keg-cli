require('KegMocks/libs/docker')
const { injectedTest } = require('KegMocks/injected/injectedTest')
const { DOCKER } = require('KegConst/docker')
const globalConfig = global.getGlobalCliConfig()

const args = {
  core: {
    globalConfig,
    params: {
      context: 'core',
    },
    cmdContext: 'core',
    contextData: {
      context: 'core',
      noPrefix: 'keg-core',
      prefix: undefined,
      cmdContext: 'core',
    },
    contextEnvs: {
      ...DOCKER.CONTAINERS.CORE.ENV,
    },
  },
  coreNoId: {
    globalConfig,
    params: {
      context: 'core',
      image: 'keg-core',
    },
    cmdContext: 'core',
    contextData: {
      context: 'core',
      image: 'keg-core',
      ...global.testDocker.images.core,
    },
    contextEnvs: {
      ...DOCKER.CONTAINERS.CORE.ENV,
    },
  },
  injected: {
    globalConfig,
    ...injectedTest
  }
}

const proxyDomainMocks = {
  'keg-core': `proxy-domain-add-plugin`,
  'tap-test': `proxy-domain-tap-feature`,
  'tap-injected-test': 'injected-proxy-value'
}

const domainFromEnv = jest.fn((itemRef, type) => {
  return `${itemRef}-${type}`
})
jest.setMock('../getProxyDomainFromEnv', { getProxyDomainFromEnv: domainFromEnv })

const domainFromBranch = jest.fn((context, path) => {
  return proxyDomainMocks[context]
})
jest.setMock('../getProxyDomainFromBranch', { getProxyDomainFromBranch: domainFromBranch })

const { getKegProxyDomain } = require('../getKegProxyDomain')

describe('getKegProxyDomain', () => {

  beforeEach(() => {
    domainFromBranch.mockClear()
    domainFromEnv.mockClear()
  })

  afterAll(() => jest.resetAllMocks())

  it('Should get the domain from git when id || rootId is NOT passed', async () => {
    expect(domainFromBranch).not.toHaveBeenCalled()
    expect(domainFromEnv).not.toHaveBeenCalled()
    const proxyDomain = await getKegProxyDomain(args.core, args.core.contextEnvs)
    expect(domainFromBranch).toHaveBeenCalled()
    expect(domainFromEnv).not.toHaveBeenCalled()
  })

  it('Should get the domain from label when id || rootId is passed', async () => {
    expect(domainFromBranch).not.toHaveBeenCalled()
    expect(domainFromEnv).not.toHaveBeenCalled()
    const proxyDomain = await getKegProxyDomain(args.coreNoId, args.coreNoId.contextEnvs)
    expect(domainFromEnv).toHaveBeenCalled()
    expect(domainFromBranch).not.toHaveBeenCalled()
  })

  it('Should get the domain from label with image and tag and no id', async () => {
    expect(domainFromBranch).not.toHaveBeenCalled()
    expect(domainFromEnv).not.toHaveBeenCalled()

    const rootId = args.coreNoId.contextEnvs.rootId
    const proxyDomain = await getKegProxyDomain({
      ...args.coreNoId,
      params: {
        image: 'keg-core',
        tag: 'develop'
      },
      contextData: {}
    }, args.coreNoId.contextEnvs)

    expect(proxyDomain).toBe('keg-core:develop-container')

    expect(domainFromEnv).toHaveBeenCalled()
    expect(domainFromBranch).not.toHaveBeenCalled()
  })

  it('Should set the type as image, when rootId exists', async () => {
    expect(domainFromBranch).not.toHaveBeenCalled()
    expect(domainFromEnv).not.toHaveBeenCalled()

    const rootId = args.coreNoId.contextEnvs.rootId
    const proxyDomain = await getKegProxyDomain({
      ...args.coreNoId,
      params: {
        image: 'keg-core',
        tag: 'develop'
      },
      contextData: { rootId: 'keg-core' }
    }, args.core.contextEnvs)

    expect(proxyDomain).toBe('keg-core:develop-image')

    expect(domainFromEnv).toHaveBeenCalled()
    expect(domainFromBranch).not.toHaveBeenCalled()
  })

  it('Should use the __injected tap value when it exists', async () => {
    expect(domainFromBranch).not.toHaveBeenCalled()
    expect(domainFromEnv).not.toHaveBeenCalled()
    const proxyDomain = await getKegProxyDomain(args.injected, args.injected.contextEnvs)

    expect(proxyDomain).toBe(proxyDomainMocks[injectedTest.params.__injected.tap])

    expect(domainFromBranch).toHaveBeenCalled()
    expect(domainFromEnv).not.toHaveBeenCalled()
  })

})
