jest.mock('@keg-hub/jsutils/src/node')
jest.mock('../getTapPath')
const { TAP_CONFIG_NAMES } = require('../../constants')
const { tryRequireSync } = require('@keg-hub/jsutils/src/node')
const { getTapConfig, getTapPackage } = require('../getTapConfig')
const { getTapPath } = require('../getTapPath')
const path = require('path')

const tapPath = '/bar/foo'
const tapName = 'foo'

describe('getTapConfig', () => {

  afterEach(() => jest.resetAllMocks())
  beforeEach(() => getTapPath.mockReturnValue(tapPath))

  it('should try all config paths', () => {
    getTapConfig({ name: tapName })

    TAP_CONFIG_NAMES.map(name =>
      expect(tryRequireSync).toHaveBeenCalledWith(path.join(tapPath, name))
    )
  })

  it('should return the first config object found', () => {
    const config = { id: '123' }
    tryRequireSync
      .mockReturnValueOnce(11)
      .mockReturnValueOnce(undefined)
      .mockReturnValueOnce(config)
      .mockReturnValue(undefined)

    const [ result, cfgPath ] = getTapConfig({ name: tapName })
    expect(result).toBe(config)
    expect(cfgPath).toBe(path.join(tapPath, TAP_CONFIG_NAMES[2]))
    expect(tryRequireSync).toHaveBeenCalledTimes(3)
  })

  it('should return null for no found config', () => {
    expect(
      getTapConfig({ name: tapName })
    ).toEqual([ null, null ])
  })

  it ('should accept the path to the tap', () => {
    const config = { id: '123' }
    tryRequireSync.mockReturnValueOnce(config)

    const [ result, cfgPath ] = getTapConfig({ path: tapPath })
    expect(result).toBe(config)
    expect(cfgPath).toBe(path.join(tapPath, TAP_CONFIG_NAMES[0]))
    expect(tryRequireSync).toHaveBeenCalledTimes(1)
  })
})

describe('getTapPackage', () => {

  beforeEach(() => getTapPath.mockReturnValue(tapPath))

  it('should get the tap package', () => {
    const package = { dependencies: {} }
    tryRequireSync.mockReturnValueOnce(package)
    expect(
      getTapPackage({ name: tapName })
    ).toEqual([
      package,
      path.join(tapPath, 'package.json')
    ])
  })

  it('should return null values in the array if no package is found', () => {
    tryRequireSync.mockReturnValueOnce(null)
    expect(
      getTapPackage({ name: tapName })
    ).toEqual([
      null,
      null
    ])

  })
})