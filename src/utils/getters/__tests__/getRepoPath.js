const { deepClone } = require('@keg-hub/jsutils')

const orgGlobalConfig = global.getGlobalCliConfig()
const globalConfig = deepClone(orgGlobalConfig)

const { getRepoPath } = require('../getRepoPath')
const fakeTapPath = 'fake/tap/path'

const originalComponentsPath = orgGlobalConfig.cli.taps.components.path
const testComponentsPath = 'test/components/path'
globalConfig.cli.taps.components.path = testComponentsPath 

globalConfig.cli.taps = {
  ...globalConfig.cli.taps,
  fake: { path: fakeTapPath },
}

describe('getRepoPath', () => {

  afterAll(() => jest.resetAllMocks())

  it('should get the repo path from the repo when passed in', () => {
    expect(getRepoPath('cli')).toBe(globalConfig.cli.paths.cli)
    expect(getRepoPath('core')).toBe(globalConfig.cli.paths.core)
  })

  it('should accept a globalConfig as the second argument', () => {
    expect(getRepoPath('components')).toBe(originalComponentsPath)
    expect(getRepoPath('components', globalConfig)).toBe(testComponentsPath)
  })

  it('should return undefined when no repo name is passed in', () => {
    expect(getRepoPath()).toBe(undefined)
  })

  it('should return undefined when the path can not be found', () => {
    expect(getRepoPath('foo-bar')).toBe(undefined)
  })

  it('should work with linked tap paths', () => {
    expect(getRepoPath('fake', globalConfig)).toBe(fakeTapPath)
  })

})
