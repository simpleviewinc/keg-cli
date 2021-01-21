const { DOCKER } = require('KegConst/docker')
const { testEnum } = require('KegMocks/jest/testEnum')
const { REPO, CONTAINERS } = DOCKER.LOCATION_CONTEXT

const globalConfig = global.getGlobalCliConfig()

const { updateLocationContext } = require('../updateLocationContext')

const testArgs = {
  tapDefined: {
    description: 'It return the REPO context location tap is defined',
    inputs: [{ params: { tap: 'test-tap', context: 'test-tap' } }],
    outputs: {
      params: { tap: 'test-tap', context: 'test-tap' },
      __internal: { locationContext: REPO },
      task: { locationContext: REPO }
    }
  },
  tapNotDefined: {
    description: 'It return the CONTAINERS context location tap is not defined',
    inputs: [{ params: { context: 'tap' } }],
    outputs: {
      params: { context: 'tap' },
      __internal: { locationContext: CONTAINERS },
      task: { locationContext: CONTAINERS }
    }
  },
}

describe('updateLocationContext', () => {

  afterAll(() => jest.resetAllMocks())

  testEnum(testArgs, updateLocationContext)

})