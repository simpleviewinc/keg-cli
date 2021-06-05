jest.resetAllMocks()
jest.clearAllMocks()

const path = require('path')
const yaml = require('js-yaml')
const { loadYml } = require('../../yml')
const writeYamlFile = require('write-yaml-file')
const { isArr, isObj, isStr, limbo } = require('@keg-hub/jsutils')
const { pathExistsSync, pathExists, remove, readFileSync, readFile } = require('fs-extra')

const {
  removeYmlFile,
  removeYmlTest,
  testYmlPath,
  testYmlWrite,
  writeYmlTest,
  writeYmlFile,
  utilValues
} = require('../../__mocks__')

const {
  getContent,
  loadTemplate,
  mergeFiles,
  removeFile,
} = require('../utils')


const testYmlData = {
  test: [ 'baz', 'foo' ],
  bar: { 'sub-content': { more: [ 'item:item' ] } }
}

const testYmlStr = `
test:
  - baz
  - foo
bar:
  sub-content:
    more:
      - 'item:item'
`.trim()

describe('utils', () => {

  beforeEach( async () => {
    await writeYmlTest()
  })

  afterAll( async () => {
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
        const content = await getContent(`/invalid/file/path`)
      }
      catch(err){
        expect(err.message.includes('File path does not exist at /invalid/file/path')).toBe(true)
        expect(err.message.includes('Could not load undefined file')).toBe(true)
      }
    })

    it(`should not throw from an invalid file path when second argument is false`, async () => {
      try {
        const content = await getContent(`/invalid/file/path`, false)
        expect(content).toEqual('')
      }
      catch(err){
        throw new Error(
          `Utils.getContent should not throw when second argument is false, but it did`
        )
      }
    })
  })

  describe('loadTemplate', () => {
    it(`should load a template and replace the values`, async () => {
      const data = { test: { array: ['item3'], key: 'item3', value: '3' }}
      const filled = await loadTemplate(utilValues.ymlStr, data, undefined, yaml.safeLoad) 
      expect(filled).toEqual(utilValues.ymlObj)
    })

    it(`should call the loader function`, async () => {
      const loader = jest.fn()
      await loadTemplate(utilValues.ymlStr, {}, null, loader) 
      expect(loader).toHaveBeenCalled()
    })

    it(`should throw if a loader function is not passed as the last argument`, async () => {
      try {
        await loadTemplate(utilValues.ymlStr, {}, null) 
      }
      catch(err){
        expect(err.message.trim()).toBe(`loader is not a function`)
      }
    })
  })

  describe('mergeFiles', () => {
    it(`should merge two config files together`, async () => {
      const secTestYmlFile = path.join(__dirname, './ymlTest2.yml')
      await writeYmlFile(testYmlPath, testYmlData)
      await writeYamlFile(secTestYmlFile, {
        test: [ 'added' ],
        bar: { 'sub-content': 'overwrite' },
      })

      const merged = await mergeFiles({
        loader: loadYml,
        files: [testYmlPath, secTestYmlFile],
      })

      await removeYmlFile(secTestYmlFile)

      expect(testYmlData.test.includes('added')).toBe(false)
      expect(testYmlData.bar['sub-content']).not.toBe('overwrite')

      expect(merged).toEqual({
        test: [ 'baz', 'foo', 'added' ],
        bar: { 'sub-content': 'overwrite' }
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
      catch(err){
        expect(err.message.includes(`Remove test file requires a file location`)).toBe(true)
      }
    })
  })
})
