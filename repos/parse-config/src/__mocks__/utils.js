const { throwError } = require('../error')

const ymlStr = `
# Yml string
test:
  array: 
    # A comment 
    - item1
    - item2
    - {{ test.array.0 }}
  object:
    item1: 1
    # another comment
    item2: 2
    {{ test.key }}: {{ test.value }}
root:
  test: "test item under second root"
`

const ymlObj = {
  test: {
    array: [ 'item1', 'item2', 'item3' ],
    object: { item1: 1, item2: 2, item3: 3 },
  },
  root: {
    test: 'test item under second root',
  },
}

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
  TEST_PATH: `/test/path`,
  OTHER_PATH: `/other/path/`,
  BOOL: true,
  SOME: 'VALUE',
  ANOTHER: 'value',
  ITEM: '1',
  MR: 'goat',
}

const stripBom = jest.fn(content => {
  return content
})

const getContentSync = jest.fn((location, throwErr = true) => {
  return location.endsWith('.yml')
    ? ymlStr
    : location.endsWith('.env')
      ? envStr
      : throwErr
        ? throwError(`Could not load file from ${location}`)
        : null
})

const getContent = jest.fn(async (location, throwErr = true) => {
  return location.endsWith('.yml')
    ? ymlStr
    : location.endsWith('.env')
      ? envStr
      : throwErr
        ? throwError(`Could not load file from ${location}`)
        : null
})

const removeFile = jest.fn(async location => {
  return location.endsWith('.yml') || location.endsWith('.env') ? true : false
})

const mergeFiles = jest.fn(async (files, loader = jest.fn()) => {
  return {}
})

const loadTemplate = jest.fn((args, content, loader) => {
  return content.includes('# Yml string')
    ? ymlObj
    : content.includes('# ENV String')
      ? envObj
      : {}
})

const resolveArgs = jest.fn(args => {
  const def = {
    error: true,
    fill: true,
    data: {},
    format: 'object',
  }
  return typeof args === 'string'
    ? { ...def, location: args }
    : { ...def, ...args }
})

const utils = {
  getContent,
  getContentSync,
  loadTemplate,
  mergeFiles,
  removeFile,
  resolveArgs,
  stripBom,
}

const resetUtils = () => {
  Object.values(utils).map(method => {
    method.mockClear()
  })
}

module.exports = {
  resetUtils,
  utils,
  utilValues: {
    envStr,
    envObj,
    ymlStr,
    ymlObj,
  },
}
