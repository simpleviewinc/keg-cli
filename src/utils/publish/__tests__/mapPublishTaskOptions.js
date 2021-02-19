const { testEnum } = require('KegMocks/jest/testEnum')
const globalConfig = global.getGlobalCliConfig()
const { mapPublishTaskOptions } = require('../mapPublishTaskOptions')

const testArgs = {
  emptyTask: {
    description: 'It should return an empty tasks object when no params are passed',
    inputs: [{ globalConfig, params: {} }],
    outputs: {
      tasks: {}
    }
  },
  setParams: {
    description: 'It should add the value of matching task params to the returned tasks object',
    inputs: [{ globalConfig, params: { install: false, commit: true, publish: false } }],
    outputs: {
      tasks: { install: false, publish: false, commit: true }
    }
  },
  noExtraParam: {
    description: 'It should not add non-allowed params',
    inputs: [{ globalConfig, params: { install: false, notAdded: true, skip: false, yolo: true } }],
    outputs: {
      tasks: { install: false }
    }
  },
}

describe('mapPublishTaskOptions', () => {

  afterAll(() => jest.resetAllMocks())

  testEnum(testArgs, mapPublishTaskOptions)

})