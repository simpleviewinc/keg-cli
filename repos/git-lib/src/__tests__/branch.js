const path = require('path')
const { isArr } = require('@keg-hub/jsutils')
const cliRoot = path.join(__dirname, '../../../../')
const { git } = require('../git')


describe('branch', () => {

  afterEach(() => jest.resetAllMocks())

  describe('list', () => {

    it('should return a list of all branches for the passed in location', async done => {

      const res = await git.branch.list(cliRoot)

      expect(isArr(res)).toBe(true)

      done()
    })

    it('should return an array of  branch objects matching the correct model', async done => {

      const res = await git.branch.list(cliRoot)
      const keys = [ 'commit', 'name', 'current', 'message' ]

      res.map(branch => keys.map(key => expect(key in branch).toBe(true)))

      done()
    })

  })

  describe('get', () => {
    it('should return a branch object for the passed in location', async done => {
      const { current, ...res } = await git.branch.get(cliRoot, 'master')
      expect(res).toMatchSnapshot()
      done()
    })

    it('should return null when the branch can not be found', async done => {
      const res = await git.branch.get(cliRoot, 'branch-does-not-exists-4321')
      expect(res).toBe(null)
      
      done()
    })

  })

})
