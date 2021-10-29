jest.resetAllMocks()
jest.clearAllMocks()

const path = require('path')
const yaml = require('js-yaml')
const { loadYml } = require('../../yml')
const writeYamlFile = require('write-yaml-file')
const { pathExistsSync } = require('fs-extra')

const {
  removeYmlFile,
  removeYmlTest,
  testYmlPath,
  writeYmlTest,
  writeYmlFile,
  utilValues,
} = require('../../__mocks__')

const {
  getContent,
  getContentSync,
  loadTemplate,
  mergeFiles,
  removeFile,
  resolveArgs,
} = require('../utils')

const testYmlData = {
  test: [ 'baz', 'foo' ],
  bar: { 'sub-content': { more: ['item:item'] } },
}

const testYmlStr = `
test:
  - baz
  - foo
bar:
  sub-content:
    more:
      - '"item:item"'
`.trim()

describe('utils', () => {
  beforeEach(async () => {
    await writeYmlTest()
  })

  afterAll(async () => {
    await removeYmlTest()
  })

  afterAll(() => jest.resetAllMocks())

  describe('getContent', () => {
    it(`should return the content from a valid file path`, async () => {
      const content = await getContent(testYmlPath)
      expect(content.trim()).toEqual(testYmlStr)
    })

    it(`should throw from an invalid file path`, async () => {
      try {
        await getContent(`/invalid/file/path`)
      }
      catch (err) {
        expect(
          err.message.includes('File path does not exist at /invalid/file/path')
        ).toBe(true)
        expect(
          err.message.includes(
            `no such file or directory, access '/invalid/file/path'`
          )
        ).toBe(true)
      }
    })

    it(`should not throw from an invalid file path when second argument is false`, async () => {
      try {
        const content = await getContent(`/invalid/file/path`, false)
        expect(content).toEqual(null)
      }
      catch (err) {
        throw new Error(
          `Utils.getContent should not throw when second argument is false, but it did`
        )
      }
    })
  })

  describe('getContentSync', () => {
    it(`should return the content from a valid file path`, () => {
      const content = getContentSync(testYmlPath)
      expect(content.trim()).toEqual(testYmlStr)
    })

    it(`should throw from an invalid file path`, () => {
      try {
        getContentSync(`/invalid/file/path`)
      }
      catch (err) {
        expect(
          err.message.includes('File path does not exist at /invalid/file/path')
        ).toBe(true)
        expect(err.message.includes('Could not load undefined file')).toBe(true)
      }
    })

    it(`should not throw from an invalid file path when second argument is false`, () => {
      try {
        const content = getContentSync(`/invalid/file/path`, false)
        expect(content).toEqual(null)
      }
      catch (err) {
        throw new Error(
          `Utils.getContentSync should not throw when second argument is false,\nError: ${err.stack}`
        )
      }
    })
  })

  describe('loadTemplate', () => {
    it(`should load a template and replace the values`, () => {
      const data = { test: { array: ['item3'], key: 'item3', value: '3' } }
      const filled = loadTemplate({ data }, utilValues.ymlStr, yaml.safeLoad)
      expect(filled).toEqual(utilValues.ymlObj)
    })

    it(`should return a filled template as a string when format is 'string'`, () => {
      const data = { test: { array: ['item3'], key: 'item3', value: '3' } }
      const filled = loadTemplate(
        { data, format: 'string' },
        utilValues.ymlStr,
        yaml.safeLoad
      )
      expect(typeof filled).toEqual('string')
      expect(filled.includes('- item3')).toBe(true)
      expect(filled.includes('item3: 3')).toBe(true)
    })

    it(`should call the loader function`, () => {
      const loader = jest.fn()
      loadTemplate({}, utilValues.ymlStr, loader)
      expect(loader).toHaveBeenCalled()
    })

    it(`should throw if content exists and a function is not passed as the last argument`, () => {
      try {
        loadTemplate({}, utilValues.ymlStr, null)
      }
      catch (err) {
        expect(err.message.trim()).toBe(`loader is not a function`)
      }
    })

    it(`should return an empty string when no content and fill === 'string'`, () => {
      const resp = loadTemplate({ format: 'string' }, false)
      expect(resp).toEqual('')
    })

    it(`should return an empty object when no content and fill !== 'string'`, () => {
      const resp = loadTemplate({}, false)
      expect(resp).toEqual({})
    })
  })

  describe('mergeFiles', () => {
    it(`should merge two config files together`, async () => {
      const secTestYmlFile = path.join(__dirname, './ymlTest2.yml')
      await writeYmlFile(testYmlPath, testYmlData)
      await writeYamlFile(secTestYmlFile, {
        test: ['added'],
        bar: { 'sub-content': 'overwrite' },
      })

      const merged = await mergeFiles({
        loader: loadYml,
        files: [ testYmlPath, secTestYmlFile ],
      })

      await removeYmlFile(secTestYmlFile)

      expect(testYmlData.test.includes('added')).toBe(false)
      expect(testYmlData.bar['sub-content']).not.toBe('overwrite')

      expect(merged).toEqual({
        test: [ 'baz', 'foo', 'added' ],
        bar: { 'sub-content': 'overwrite' },
      })
    })
  })

  describe('removeFile', () => {
    it(`Should remove a file if it exists`, async () => {
      await writeYmlFile(testYmlPath, testYmlData)
      const exists = await pathExistsSync(testYmlPath)
      expect(exists).toBe(true)

      await removeFile(testYmlPath)
      const stillExists = await pathExistsSync(testYmlPath)
      expect(stillExists).toBe(false)
    })

    it(`should throw from an invalid file path`, async () => {
      try {
        await removeFile(undefined, 'test')
      }
      catch (err) {
        expect(
          err.message.includes(`Remove test file requires a file location`)
        ).toBe(true)
      }
    })
  })

  describe('resolveArgs', () => {
    it(`Should return an object of defaults merged with passed in object`, async () => {
      const resolved = resolveArgs({ test: 'value' })
      expect(resolved.test).toBe('value')
      expect(resolved.error).toBe(true)
      expect(resolved.format).toBe('object')
      expect(typeof resolved.data).toBe('object')
      expect(resolved.location).toBe(undefined)
    })

    it(`Should set the location property when passed in value is a string`, async () => {
      const resolved = resolveArgs('some/location/string')
      expect(resolved.error).toBe(true)
      expect(resolved.format).toBe('object')
      expect(typeof resolved.data).toBe('object')
      expect(resolved.location).toBe('some/location/string')
    })
  })
  

})
