const { testEnum } = require('KegMocks/jest/testEnum')
const { docker } = require('KegMocks/libs/docker')
jest.setMock('KegDocCli', docker)

const getKegContextMock = jest.fn(containerName => containerName)
jest.setMock('KegUtils/getters/getKegContext', { getKegContext: getKegContextMock })

const getSettingMock = jest.fn(() => ('default-env'))
jest.setMock('KegUtils/globalConfig/getSetting', { getSetting: getSettingMock })

const loadValuesFilesMock = jest.fn()
jest.setMock('KegConst/docker/loaders', { loadValuesFiles: loadValuesFilesMock })

const testArgs = {
  callLoadValuesFiles: {
    description: 'Calls the loadValuesFiles method',
    inputs: [{ env: 'test-env', containerRef: 'test-ref' }],
    outputs: () => expect(loadValuesFilesMock).toHaveBeenCalled()
  },
  setsLoadPathToBeActions: {
    description: 'Passes the loadPath param as "actions"',
    inputs: [{ env: 'test-env', containerRef: 'test-ref' }],
    outputs: () => {
      expect(loadValuesFilesMock).toHaveBeenCalled()
      outputs: () => (
        expect(loadValuesFilesMock.mock.calls[0][0].loadPath).toEqual('actions')
      )
    }
  },
  doesNotCallGetSetting: {
    description: 'Does not call the getSetting method when env is passed',
    inputs: [{ env: 'test-env', containerRef: 'test-ref' }],
    outputs: () => expect(getSettingMock).not.toHaveBeenCalled()
  },
  callGetSettingWhenNoEnv: {
    description: 'Calls the getSetting when no env is passed',
    inputs: [{ containerRef: 'test-ref' }],
    outputs: () => expect(getSettingMock).toHaveBeenCalled(),
  },
  defaultEnvWhenNoEnvPassed: {
    description: 'Uses the default env when no env is passed',
    inputs: [{ containerRef: 'test-ref' }],
    outputs: () => expect(loadValuesFilesMock.mock.calls[0][0].env).toEqual('default-env')
  },
  usesPassedInEnvOverDefault: {
    description: 'Uses the passed in env over the default env',
    inputs: [{ env: 'test-env', containerRef: 'test-ref' }],
    outputs: () => expect(loadValuesFilesMock.mock.calls[0][0].env).toEqual('test-env')
  },
  passesInternalAndInjected: {
    description: 'Merges and passed the __internal and __injected objects',
    inputs: [{ 
      containerRef: 'test-ref',
      env: 'test-env',
      __internal: { internal: true },
      __injected: { injected: true } 
    }],
    outputs: () => {
      expect(loadValuesFilesMock.mock.calls[0][0].__internal.internal).toBe(true)
      expect(loadValuesFilesMock.mock.calls[0][0].__internal.injected).toBe(true)
    }
  },
  injectedOverridesInternal: {
    description: 'Keys in the __injected object override the __internal object',
    inputs: [{ 
      containerRef: 'test-ref',
      env: 'test-env',
      __internal: { internal: true },
      __injected: { internal: false } 
    }],
    outputs: () => {
      expect(loadValuesFilesMock.mock.calls[0][0].__internal.internal).toBe(false)
    }
  },
  usesContainerWhenNoContainerRef: {
    description: 'Uses the container property when no containerRef property exists',
    inputs: [{ 
      container: 'test-container',
      env: 'test-env',
    }],
    outputs: () => {
      expect(loadValuesFilesMock.mock.calls[0][0].container).toBe('test-container')
    }
  },
  containerRefOverridesContainer: {
    description: 'The containerRef property overrides the container property',
    inputs: [{ 
      containerRef: 'overrides-container',
      container: 'test-container',
      env: 'test-env', 
    }],
    outputs: () => {
      expect(loadValuesFilesMock.mock.calls[0][0].container).toBe('overrides-container')
    }
  },
  contextOverridesContainerRef: {
    description: 'The context property overrides the containerRef property',
    inputs: [{ 
      context: 'overrides-container',
      containerRef: 'test-container',
      env: 'test-env', 
    }],
    outputs: () => {
      expect(loadValuesFilesMock.mock.calls[0][0].container).toBe('overrides-container')
    }
  },
  cmdContextOverridesContext: {
    description: 'The cmdContext property overrides the context property',
    inputs: [{ 
      cmdContext: 'overrides-container',
      context: 'test-container',
      env: 'test-env', 
    }],
    outputs: () => {
      expect(loadValuesFilesMock.mock.calls[0][0].container).toBe('overrides-container')
    }
  },
}

const { getActionsFromValues } = require('../getActionsFromValues')

describe('getActionsFromValues', () => {
  beforeEach(() => {
    getSettingMock.mockClear()
    loadValuesFilesMock.mockClear()
  })
  afterAll(() => jest.resetAllMocks())
  testEnum(testArgs, getActionsFromValues)
})
