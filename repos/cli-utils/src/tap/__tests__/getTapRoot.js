jest.mock('../../path/getPackageRoot', () => ({ getPackageRoot: jest.fn() }))
jest.mock('../getTapPath', () => ({ getTapPath: jest.fn() }))
const { getPackageRoot } = require('../../path/getPackageRoot')
const { getTapRoot, getTapPath } = require('../')

describe('getTapRoot', () => {

  it('should just find the path root if its called with location', () => {
    getPackageRoot.mockReturnValue('/foo')
    const location = 'my/test/path'
    const result = getTapRoot({ location })
    expect(result).toEqual('/foo')
  })

  it('should get the tap path if called with tap alias', () => {
    getTapPath.mockReturnValue('/foo')
    const tap = 'my_tap'
    const result = getTapRoot({ tap })
    expect(result).toEqual('/foo')
  })

  it('should throw if required arguments are omitted', () => {
    expect(
      getTapRoot
    ).toThrow()
  })

})