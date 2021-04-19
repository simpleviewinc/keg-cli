jest.resetModules()
jest.resetAllMocks()
jest.clearAllMocks()

const path = require('path')
const mocksPath = path.join(__dirname, '../../../__mocks__')
const configPath = path.join(mocksPath, './configMock/cli.config.json')

describe('getKegGlobalConfig', () => {

  it('should throw an error if the config can not be loaded', () => {
    process.env.KEG_GLOBAL_CONFIG = undefined
    const { getKegGlobalConfig } = require('../getKegGlobalConfig')
    expect(() => {
      getKegGlobalConfig()
    }).toThrow()
  })

  it('should not throw an error if false is passed as the first argument', () => {
    process.env.KEG_GLOBAL_CONFIG = undefined
    const { getKegGlobalConfig } = require('../getKegGlobalConfig')
    expect(() => {
      getKegGlobalConfig(false)
    }).not.toThrow()
  })

  it('should load the global keg-config from the KEG_GLOBAL_CONFIG env', () => {
    jest.resetModules()
    process.env.KEG_GLOBAL_CONFIG = configPath
    const { getKegGlobalConfig } = require('../getKegGlobalConfig')
    let config
    expect(() => {
      config = getKegGlobalConfig()
    }).not.toThrow()

    expect(config.version).toBe('mock-cli-version')
    expect(config.name).toBe('mock-keg-cli')
    expect(config.displayName).toBe('Mock Keg CLI')
  })

})