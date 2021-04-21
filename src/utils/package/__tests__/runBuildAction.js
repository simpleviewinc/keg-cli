const { testEnum } = require('KegMocks/jest/testEnum')

const testArgs = {
  test: {
    description: '',
    inputs: [''],
    outputs: ''
  },
}

const { runBuildAction } = require('../runBuildAction')

describe('runBuildAction', () => {
  afterAll(() => jest.resetAllMocks())
  testEnum(testArgs, runBuildAction, true)
})