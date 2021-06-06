jest.resetAllMocks()
jest.clearAllMocks()

const fs = require('fs-extra')
const writeFileMock = jest.fn(async (location, data) => {
  const throwError = () => {
    throw Error(`Invalid file path`)
  }
  return location.endsWith('.env') ? true : throwError()
})
jest.setMock('fs-extra', { ...fs, writeFile: writeFileMock })

const { utils, resetUtils, utilValues } = require('../../__mocks__')
jest.setMock('../../utils', utils)

const data = {}
const { env } = require('../env')

describe('ENV files', () => {
 
  beforeEach(() => {
    resetUtils()
    writeFileMock.mockClear()
  })

  afterAll(() => jest.resetAllMocks())

  describe('loadEnv', () => {
    it('should call utils.getContent', async () => {
      await env.load({ location: `/some/env/path.env`, data })
      expect(utils.getContent).toHaveBeenCalled()
    })

    it('should call utils.loadTemplate', async () => {
      await env.load({ location: `/some/env/path.env`, data })
      expect(utils.loadTemplate).toHaveBeenCalled()
    })

    it('should not throw when the path is valid', async () => {
      try {
        const content = await env.load({ location: `/some/env/path.env`, data })
        expect(content).toEqual(utilValues.envObj)
      }
      catch (err) {
        throw new Error(
          `env.load should not throw with a valid path, but it did!`
        )
      }
    })

    it('should throw when the path is invalid', async () => {
      const location = `/some/invalid/env/path`
      try {
        await env.load({ location, data })
      }
      catch (err) {
        expect(err.message.trim()).toEqual(
          `Could not load file from ${location}`
        )
      }
    })
  })

  describe('loadEnvSync', () => {
    it('should call utils.getContentSync', async () => {
      await env.loadSync({ location: `/some/env/path.env`, data })
      expect(utils.getContentSync).toHaveBeenCalled()
    })

    it('should call utils.loadTemplate', async () => {
      await env.loadSync({ location: `/some/env/path.env`, data })
      expect(utils.loadTemplate).toHaveBeenCalled()
    })

    it('should not throw when the path is valid', async () => {
      try {
        const content = await env.loadSync({ location: `/some/env/path.env`, data })
        expect(content).toEqual(utilValues.envObj)
      }
      catch (err) {
        throw new Error(
          `env.load should not throw with a valid path, but it did!`
        )
      }
    })

    it('should throw when the path is invalid', async () => {
      const location = `/some/invalid/env/path`
      try {
        await env.loadSync({ location, data })
      }
      catch (err) {
        expect(err.message.trim()).toEqual(
          `Could not load file from ${location}`
        )
      }
    })
  })

  describe('writeEnv', () => {
    it('should call the fs.writeFile method', async () => {
      await env.write(`/path/to/som/file.env`, data)
      expect(writeFileMock).toHaveBeenCalled()
    })

    it('should not throw when the path is valid', async () => {
      try {
        await env.write(`/path/to/som/file.env`, data)
      }
      catch (err) {
        throw new Error(
          `env.write should not throw with a valid path, but it did!`
        )
      }
    })

    it('should throw when the path is invalid', async () => {
      const location = `/some/invalid/env/path`
      try {
        await env.write(location, data)
      }
      catch (err) {
        expect(err.message.includes(`Invalid file path`)).toBe(true)
      }
    })
  })

  describe('mergeEnv', () => {
    it('should call utils.mergeFiles', async () => {
      await env.merge({ files: [ `some/file/path`, `another/file/path` ] })
      expect(utils.mergeFiles).toHaveBeenCalled()
    })
  })

  describe('removeEnv', () => {
    it('should call utils.mergeFiles', async () => {
      await env.remove(`some/file/path`)
      expect(utils.removeFile).toHaveBeenCalled()
    })
  })
})
