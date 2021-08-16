jest.resetAllMocks()

const path = require('path')
const KegPConf = require('KegPConf')
const { Logger } = require('KegMocks/logger')
jest.setMock('KegLog', { Logger })

const fillTemplateMock = jest.fn((...args) => KegPConf.fillTemplate(...args))
jest.setMock('KegPConf', {
  ...KegPConf,
  fillTemplate: fillTemplateMock
})
const generalErrorMock = jest.fn(message => {
  throw new Error(message)
})
jest.setMock('../../error/generalError', { generalError: generalErrorMock })

const { fillTemplate, loadTemplate } = require('../template')

describe('template', () => {

  beforeEach(() => {
    fillTemplateMock.mockClear()
    generalErrorMock.mockClear()
  })

  afterAll(() => jest.resetAllMocks())

  describe('fillTemplate', () => {

    beforeEach(() => {
      fillTemplateMock.mockClear()
      generalErrorMock.mockClear()
    })

    it('should fill passed in string templates', () => {
      const filled = fillTemplate({
        template: 'I am a {{ thing }}',
        data: { thing: 'test' },
      })
      expect(filled).toBe('I am a test')
    })

    it('should load and fill template from a passed in location', async () => {
      const testTemplate = path.join(__dirname, './test-template.tmp')
      const filled = await fillTemplate({
        loc: testTemplate,
        data: { thing: 'test-from-file' },
      })
      expect(filled).toBe('I am a test-from-file')
    })
  })

  describe('loadTemplate', () => {
    beforeEach(() => {
      fillTemplateMock.mockClear()
      generalErrorMock.mockClear()
    })

    it('should find an fill a template by file name that exists in the templates folder', async () => {
      const content = await loadTemplate('task', {
        name: `testTask`,
        alias: `'test', 'alias', 'thing'`,
        description: `Test Task description`,
        example: `Test task example`
      })

      expect(content.includes(`* Test Task description`)).toBe(true)
      expect(content.includes(`const testTask = args =>`)).toBe(true)
      expect(content.includes(`testTask: {`)).toBe(true)
      expect(content.includes(`alias: [ 'test', 'alias', 'thing' ]`)).toBe(true)
      expect(content.includes(`action: testTask,`)).toBe(true)
      expect(content.includes(`description: \`Test Task description\`,`)).toBe(true)
      expect(content.includes(`example: 'Test task example',`)).toBe(true)
    })

    it('should thrown an error if the template does not exist', async () => {
      expect(generalErrorMock).not.toHaveBeenCalled()
      try {
        const content = await loadTemplate('no-exists', {})
      }
      catch(err){
        expect(generalErrorMock).toHaveBeenCalled()
        expect(err.message.trim().includes(`Template with name "no-exists" does not exist!`.trim()))
          .toBe(true)
      }
    })

  })

})
