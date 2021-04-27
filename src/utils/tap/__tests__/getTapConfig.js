jest.mock('@keg-hub/jsutils/src/node')
const { TAP_CONFIG_NAMES } = require('KegConst/constants')
const { tryRequireSync } = require('@keg-hub/jsutils/src/node')
const { getTapConfig, getTapPackage } = require('../getTapConfig')
const path = require('path')

const tapRoot = 'foo/bar/'

describe('getTapConfig', () => {

  afterEach(() => jest.resetAllMocks())

  it('should try all config paths', () => {
    getTapConfig(tapRoot)

    TAP_CONFIG_NAMES.map(name =>
      expect(tryRequireSync).toHaveBeenCalledWith(path.join(tapRoot, name))
    )
  })

  it('should return the first config object found', () => {
    const config = { id: '123' }
    tryRequireSync
      .mockReturnValueOnce(11)
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce(config)
      .mockReturnValue(undefined)

    const [ result, cfgPath ] = getTapConfig(tapRoot)
    expect(result).toBe(config)
    expect(cfgPath).toBe(path.join(tapRoot, TAP_CONFIG_NAMES[2]))
    expect(tryRequireSync).toHaveBeenCalledTimes(3)
  })

  it('should return null for no found config', () => {
    expect(
      getTapConfig(tapRoot)
    ).toEqual([ null, null ])
  })
})

describe('getTapPackage', () => {
  it('should get the tap package', () => {
    const package = { dependencies: {} }
    tryRequireSync.mockReturnValueOnce(package)
    expect(
      getTapPackage(tapRoot)
    ).toEqual([
      package,
      path.join(tapRoot, 'package.json')
    ])
  })

  it('should return null values in the array if no package is found', () => {
    tryRequireSync.mockReturnValueOnce(null)
    expect(
      getTapPackage(tapRoot)
    ).toEqual([
      null,
      null
    ])

  })
})