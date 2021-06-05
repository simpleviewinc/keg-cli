jest.resetAllMocks()
jest.clearAllMocks()

const { parse, stringify } = require('../envParser')

const envStr = `
  # ENV String
  TEST_PATH={{ test.path }}
  OTHER_PATH=/other/path/

  # --- Middle comment --- #
  BOOL: true
  # Last
  SOME="VALUE"
  ANOTHER='value'
  ITEM=1
  MR=goat
`

const envObj = {
  TEST_PATH: '{{ test.path }}',
  OTHER_PATH: '/other/path/',
  BOOL: true,
  SOME: 'VALUE',
  ANOTHER: 'value',
  ITEM: '1',
  MR: 'goat'
}

const envStrNoComments = `
TEST_PATH={{ test.path }}
OTHER_PATH=/other/path/
BOOL=true
SOME=VALUE
ANOTHER=value
ITEM=1
MR=goat
`

describe('envParser', () => {
  describe('parse', () => {
    it(`should parse the passed in env content`, () => {
      expect(parse(envStr)).toEqual(envObj)
    })
  })

  describe('stringify', () => {
    it(`should stringify the passed in object into env content file`, () => {
      expect(stringify(envObj).trim()).toEqual(envStrNoComments.trim())
    })
  })
})