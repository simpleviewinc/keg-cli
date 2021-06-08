jest.resetAllMocks()
jest.clearAllMocks()

const {
  removeYmlJson,
  testYmlJsonPath,
  writeYmlFile,
  utilValues,
} = require('../../__mocks__')

const { template } = require('@keg-hub/jsutils')
const { execTemplate, fillTemplate, setDefaultPattern } = require('../template')

const ymlTmpStrIn = `
test:
  template: '{{mr.goat}}'
variants:
  - '{{item.0}}'
  - '{{item.0 }}'
  - '{{ item.0}}'
  - '{{ item.0 }}'
`

const ymlTmpObjIn = {
  test: {
    template: '{{mr.goat}}',
  },
  variants: [ `{{item.0}}`, `{{item.0 }}`, `{{ item.0}}`, `{{ item.0 }}` ],
}
const ymlTmpData = {
  mr: { goat: 'I am goat' },
  item: ['mr.goat'],
}
const ymlTmpOut = `
test:
  template: 'I am goat'
variants:
  - 'mr.goat'
  - 'mr.goat'
  - 'mr.goat'
  - 'mr.goat'
`.trim()

describe('template', () => {
  describe('execTemplate', () => {
    it(`Should fill the template with values from the data object`, () => {
      expect(utilValues.ymlStr.includes(`- item3`)).toBe(false)
      expect(utilValues.ymlStr.includes(`item3: 3`)).toBe(false)

      const data = { test: { array: ['item3'], key: 'item3', value: '3' } }
      const filled = execTemplate(utilValues.ymlStr, data)
      expect(filled.includes(`- item3`)).toBe(true)
      expect(filled.includes(`item3: 3`)).toBe(true)
    })

    it(`Should remove template values when they don't exist`, () => {
      expect(utilValues.envStr.includes(`{{ test.path }}`)).toBe(true)

      const filled = execTemplate(utilValues.envStr, { test: {} })

      expect(filled.includes(`{{ test.path }}`)).toBe(false)
    })
  })

  describe('fillTemplate', () => {
    beforeEach(async () => {
      await writeYmlFile(testYmlJsonPath, ymlTmpObjIn)
    })

    afterEach(async () => {
      await removeYmlJson()
    })

    it(`Should load and fill a template from a location`, async () => {
      const filled = await fillTemplate({
        location: testYmlJsonPath,
        data: ymlTmpData,
      })

      expect(filled.trim()).toEqual(ymlTmpOut)
    })

    it(`Should load and fill a template from passed in template`, async () => {
      const filled = await fillTemplate({
        template: ymlTmpStrIn,
        data: ymlTmpData,
      })
      expect(filled.trim()).toEqual(ymlTmpOut)
    })
  })

  describe('setDefaultPattern', () => {
    it(`should change the regex pattern used on the template method`, async () => {
      setDefaultPattern(/\[\[([^\]]*)\]\]/g)
      const strRegex = `/\\[\\[([^\\]]*)\\]\\]/g`

      expect(template.regex.toString()).not.toBe(strRegex)
      await fillTemplate({ template: ymlTmpStrIn, data: ymlTmpData })
      expect(template.regex.toString()).toBe(strRegex)
    })
  })
})
