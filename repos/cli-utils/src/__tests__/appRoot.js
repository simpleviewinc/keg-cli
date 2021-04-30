jest.resetAllMocks()
jest.clearAllMocks()

const path = require('path')
const cliUtilsRoot = path.join(__dirname, '../../../../')
const cliUtilsSrc = path.join(__dirname, '../../src')

const { getAppRoot, setAppRoot } = require('../appRoot')

describe('appRoot', () => {

  describe('getAppRoot', () => {
    it('should return the found app root', () => {
      expect(getAppRoot()).toBe(cliUtilsSrc)
    })

    it('should use the module parent and path to find the root module', () => {
      module.parent = null
      module.path = '/custom/test/path'
      expect(getAppRoot()).toBe('/custom/test')
    })

    it('should use app-root-path when its not equal to the cliUtils root path', () => {
      jest.resetModules()
      delete require.cache['../appRoot']
      delete require.cache['app-root-path']
      jest.setMock('app-root-path', { path: 'some/custom/path' })
      const { getAppRoot } = require('../appRoot')
      expect(getAppRoot()).toBe('some/custom/path')
    })
  })

  describe('setAppRoot', () => {
    it('should set the app root and override the default appRoot', () => {
      setAppRoot(cliUtilsRoot)
      const appRoot = getAppRoot()
      expect(appRoot).not.toBe(cliUtilsSrc)
      expect(appRoot).toBe(cliUtilsRoot)
    })

    it('should NOT set the appRoot if its already been set', () => {
      jest.resetModules()
      delete require.cache['../appRoot']
      const { getAppRoot, setAppRoot } = require('../appRoot')
      setAppRoot('/some/custom/path')
      setAppRoot(cliUtilsRoot)
      const appRoot = getAppRoot()

      expect(appRoot).not.toBe(cliUtilsRoot)
      expect(appRoot).toBe('/some/custom/path')
    })
  })

})