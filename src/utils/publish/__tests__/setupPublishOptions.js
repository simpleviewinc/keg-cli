const { testEnum } = require('KegMocks/jest/testEnum')
const defaultConfig = require('KegScripts/setup/cli.config.json')

const globalConfig = global.getGlobalCliConfig()

const { setupPublishOptions } = require('../setupPublishOptions')

const testArgs = {
  defaultConfig: {
    description: 'It should return the default publish config when no inputs are passed',
    inputs: [],
    outputs: {
      install: {
        description: 'Will perform install task during the publish service',
        example: 'keg hub publish --install'
      },
      test: {
        description: 'Will perform test task during the publish service',
        example: 'keg hub publish --test'
      },
      build: {
        description: 'Will perform build task during the publish service',
        example: 'keg hub publish --build'
      },
      publish: {
        description: 'Will perform publish task during the publish service',
        example: 'keg hub publish --publish'
      },
      commit: {
        description: 'Will perform commit task during the publish service',
        example: 'keg hub publish --commit'
      }
    }
  },
  taskName: {
    description: 'It should set the taskName from the second input argument',
    inputs: [null, 'test'],
    outputs: {
      install: {
        description: 'Will perform install task during the publish service',
        example: `keg test publish --install`
      },
      test: {
        description: 'Will perform test task during the publish service',
        example: `keg test publish --test`
      },
      build: {
        description: 'Will perform build task during the publish service',
        example: `keg test publish --build`
      },
      publish: {
        description: 'Will perform publish task during the publish service',
        example: `keg test publish --publish`
      },
      commit: {
        description: 'Will perform commit task during the publish service',
        example: `keg test publish --commit`
      }
    }
  },
  customTasks: {
    description: 'It return use custom tasks when passed as the first input argument',
    inputs: [{ duper: true }],
    outputs: {
      duper: {
        description: 'Will perform duper task during the publish service',
        example: `keg hub publish --duper`
      }
    }
  },
}

describe('setupPublishOptions', () => {

  afterAll(() => jest.resetAllMocks())

  testEnum(testArgs, setupPublishOptions)

})