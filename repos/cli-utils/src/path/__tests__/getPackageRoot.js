jest.mock('@keg-hub/jsutils/src/node', () => ({
  tryRequireSync: jest.fn()
}))
const { tryRequireSync } = require('@keg-hub/jsutils/src/node')
const { getPackageRoot } = require('../')

describe('getPackageRoot', () => {

  it('should check all paths up to the root, then return null when nothing is found', () => {
    tryRequireSync.mockReturnValue(null)
    expect(getPackageRoot('my/test/file/path')).toBeNull()
  })

  it('should return the first ancestor path that has a package.json file', () => {
    tryRequireSync.mockReturnValueOnce(null).mockReturnValueOnce({})
    expect(getPackageRoot('my/test/file/path')).toEqual(
      expect.stringMatching('.*my/test/file$')
    )
  })

})