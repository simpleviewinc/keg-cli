const { DOCKER } = require('KegConst/docker')
const { testEnum } = require('KegMocks/jest/testEnum')

const globalConfig = global.getGlobalCliConfig()

const { checkEnvConstantValue } = require('../checkEnvConstantValue')

const testArgs = {
  envDoesNotMatch: {
    description: 'It returns false when the ENV value does not match',
    inputs: ['core', 'KEG_EXEC_CMD', 'test:cmd'],
    outputs: false
  },
  envDoesNotExistMatchTrue: {
    description: 'It returns false when the ENV does not exist and matchValue is true',
    inputs: ['core', 'NOT_VALID_TEST_ENV', true],
    outputs: false
  },
  envDoesNotExistMatchFalse: {
    description: 'It returns false when the ENV does not exist and matchValue is false',
    inputs: ['core', 'NOT_VALID_TEST_ENV', false],
    outputs: false
  },
  noContextPassed: {
    description: 'It returns false when no context is passed',
    inputs: [null, 'KEG_EXEC_CMD', 'test-match-value'],
    outputs: false
  },
  noEnvPassed: {
    description: 'It returns false when no ENV is passed',
    inputs: ['core', null, 'test-match-value'],
    outputs: false
  },
  envExistsNoMatchValue: {
    description: 'It returns true when the ENV value exists and not match value is passed',
    inputs: ['core', 'KEG_PROXY_PORT'],
    outputs: true
  },
  envMatchesMatchValue: {
    description: 'It returns true when the ENV value matches the passed in match value',
    inputs: ['core', 'DOC_APP_PATH', '/keg/keg-core'],
    outputs: true
  },
}

describe('checkEnvConstantValue', () => {

  afterAll(() => jest.resetAllMocks())

  testEnum(testArgs, checkEnvConstantValue)

})