jest.resetModules()
jest.resetAllMocks()
jest.clearAllMocks()
const { setSharedOptions, sharedOptions } = require('../sharedOptions')

const defArgs = [
  [ 'test-action', {}, null, 'group' ],
  [ 'test-action', { shared: { name: 'shared' }, other: { name: 'other' } }, [], '' ]
]

describe('getKegGlobalConfig', () => {

  describe('setSharedOptions', () => {

    it('should add the options to all when no group name is passed', () => {
      const allOpts = { all: { name: 'all' } }
      setSharedOptions(allOpts)
      const options = sharedOptions('test-action')
      expect(options).toEqual(allOpts)
    })

    it('should add the options to groups when group name is passed', () => {
      const groupOpts = { group: { group : { name: 'group' } } }
      setSharedOptions(groupOpts, true)
      const options = sharedOptions(...defArgs[0])
      expect(options).toEqual(groupOpts.group)
    })

  })

  describe('sharedOptions', () => {

    it('should return the correct options', () => {
      const options = sharedOptions(...defArgs[1])
      expect(options).toEqual(defArgs[1][1])
    })

    it('should only return items from the filter array', () => {
      const args = [...defArgs[1]]
      args[1] = {}
      args[2] = [ 'shared' ]
      setSharedOptions(defArgs[1][1])
      const options = sharedOptions(...args)
      expect(options).toEqual({ shared: { name: 'shared' } })
    })

  })

})