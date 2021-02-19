const { testEnum } = require('KegMocks/jest/testEnum')
const globalConfig = global.getGlobalCliConfig()
const { getPublishContext } = require('../getPublishContext')



const testArgs = {
  mergedContext: {
    description: 'It should merge the default, context, and custom args into one object',
    inputs: [globalConfig, 'test', { tasks: { custom: true }}],
    outputs: {
      tasks: {
        install: true,
        test: true,
        build: true,
        publish: true,
        commit: true,
        custom: true
      },
      name: 'test',
      dependent: true,
      order: {
        '0': '@keg-hub/re-theme',
        '1': '@keg-hub/keg-components',
        '2': '@keg-hub/keg-core'
      }
    }
  },
  noContext: {
    description: 'It should work with no context',
    inputs: [globalConfig, null, { tasks: { custom: true }}],
    outputs: {
      tasks: {
        install: true,
        test: true,
        build: true,
        publish: true,
        commit: true,
        custom: true
      }
    }
  },
  noCustom: {
    description: 'It should work with no custom args',
    inputs: [globalConfig],
    outputs: {
      tasks: {
        install: true,
        test: true,
        build: true,
        publish: true,
        commit: true,
      }
    }
  },
}

describe('getPublishContext', () => {

  afterAll(() => jest.resetAllMocks())

  testEnum(testArgs, getPublishContext)

})