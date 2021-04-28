const { getTapPath } = require('../getTapPath')
const globalConfig = require('KegMocks/helpers/globalConfig')

describe('getTapPath', () => {
  it('should find the path to the tap', () => {
    const path = getTapPath('test', globalConfig)
    expect(path).toEqual(globalConfig.cli.taps.test.path)
  })

  it('should return null if name is falsey', () => {
    const orig = console.error
    console.error = jest.fn()
    const path = getTapPath(undefined, globalConfig)
    expect(path).toEqual(null)
    console.error = orig
  })
})