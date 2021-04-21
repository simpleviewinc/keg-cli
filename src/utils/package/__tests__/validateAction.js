const { testEnum } = require('KegMocks/jest/testEnum')

const testArgs = {
  test: {
    description: '',
    inputs: [{}, '', true],
    outputs: ''
  },
}

const { validateAction } = require('../validateAction')

describe('validateAction', () => {
  afterAll(() => jest.resetAllMocks())
  testEnum(testArgs, validateAction, true)
})