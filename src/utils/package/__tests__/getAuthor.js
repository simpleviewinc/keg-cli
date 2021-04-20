const { testEnum } = require('KegMocks/jest/testEnum')

const globalConfig = global.getGlobalCliConfig()
const customUserConfig = { ...globalConfig, docker: { user: 'override' } }

jest.setMock('../../globalConfig/globalConfigCache', {
  __getGlobalConfig: jest.fn(() => globalConfig)
})

const { getAuthor } = require('../getAuthor')

const testArgs = {
  noConfigNoAuthor: {
    description: 'It should get the author from the global config when no args are passed',
    inputs: [],
    outputs: 'testuser'
  },
  globalConfigOverride: {
    description: 'It should use the passed in globalConfig over the default loaded config',
    inputs: [customUserConfig],
    outputs: 'override'
  },
  authOverride: {
    description: 'It should use the passed in author over the one loaded from the config',
    inputs: [{}, 'author-override'],
    outputs: 'author-override'
  }
}

describe('getAuthor', () => {
  afterAll(() => jest.resetAllMocks())
  testEnum(testArgs, getAuthor)
})