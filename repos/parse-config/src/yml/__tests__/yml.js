jest.resetAllMocks()
jest.clearAllMocks()

const { utils, resetUtils, utilValues } = require('../../__mocks__')
jest.setMock('../../utils', utils)

const writeYmlFile = jest.fn(async (location, data) => {
  const throwError = () => {throw Error(`Invalid file path`)}
  return (location.endsWith('.yml') || location.endsWith('.env')) ? true : throwError()
})
jest.setMock('write-yaml-file', writeYmlFile)


const data = {}
const { yml } = require('../yml')

describe('Yaml files', () => {

  beforeAll(() => {
    resetUtils()
  })

  beforeEach(() => {
    writeYmlFile.mockClear()
  })

  afterAll(() => jest.resetAllMocks())

  describe('loadYml', () => {
    it('should call utils.getContent', async () => {
      await yml.load({ location: `/some/yml/path.yml`, data })
      expect(utils.getContent).toHaveBeenCalled()
    })

    it('should call utils.loadTemplate', async () => {
      await yml.load({ location: `/some/yml/path.yml`, data })
      expect(utils.loadTemplate).toHaveBeenCalled()
    })

    it('should not throw when the path is valid', async () => {
      try {
        const content = await yml.load({ location: `/some/yml/path.yml`, data })
        expect(content).toEqual(utilValues.ymlObj)
      }
      catch(err){
        throw new Error(`yml.load should not throw with a valid path, but it did!`)
      }
    })

    it('should throw when the path is invalid', async () => {
      const location = `/some/invalid/yml/path`
      try {
        await yml.load({ location, data })
      }
      catch(err){
        expect(err.message.trim()).toEqual(`Could not load file from ${location}`)
      }
    })
  })

  describe('writeYml', () => {

    it('should call the writeYmlFile method', async () => {
      await yml.write(`/path/to/som/file.yml`)
      expect(writeYmlFile).toHaveBeenCalled()
    })

    it('should not throw when the path is valid', async () => {
      try {
        await yml.write(`/path/to/som/file.yml`)
      }
      catch(err){
        throw new Error(`yml.write should not throw with a valid path, but it did!`)
      }
    })

    it('should throw when the path is invalid', async () => {
      const location = `/some/invalid/yml/path`
      try {
        await yml.write(location, data)
      }
      catch(err){
        expect(err.message.includes(`Invalid file path`)).toBe(true)
      }
    })

  })

  describe('mergeYml', () => {
    it('should call utils.mergeFiles', async () => {
      await yml.merge(`some/file/path`, `another/file/path`)
      expect(utils.mergeFiles).toHaveBeenCalled()
    })
  })

  describe('removeYml', () => {
    it('should call utils.mergeFiles', async () => {
      await yml.remove(`some/file/path`)
      expect(utils.removeFile).toHaveBeenCalled()
    })
  })

})