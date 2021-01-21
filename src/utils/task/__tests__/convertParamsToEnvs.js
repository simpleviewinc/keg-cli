const { testEnum } = require('KegMocks/jest/testEnum')
const { deepClone, isObj } = require('@keg-hub/jsutils')

const globalConfig = global.getGlobalCliConfig()
jest.setMock('../../globalConfig/globalConfigCache', {
  __getGlobalConfig: jest.fn(() => globalConfig)
})

const testArgs = {
  localParam: {
    description: 'It should set the KEG_COPY_LOCAL env when local param is true',
    inputs: [{ local: true }, false],
    outputs: { KEG_COPY_LOCAL: true }
  },
  envArg: {
    description: 'It should set the KEG_COPY_LOCAL env when second argument is true',
    inputs: [{}, true],
    outputs: { KEG_COPY_LOCAL: true }
  },
  paramOverride: {
    description: 'The param should override the second argument',
    matchers: [ 'not.toEqual' ],
    inputs: [{ local: false }, true],
    outputs: { KEG_COPY_LOCAL: true }
  },
  setting: {
    description: 'It should use the global setting when param and argument dont exist',
    inputs: [{}],
    outputs: { KEG_COPY_LOCAL: globalConfig.cli.settings.docker.defaultLocalBuild }
  }
}



const defArgs = { env: 'develop', command: 'run', install: true, local: true }
const contextEnv = { KEG_FOO: 'BAR', KEG_BAZ: 'BAS' }

const { convertParamsToEnvs } = require('../convertParamsToEnvs')

describe('convertParamsToEnvs', () => {

  afterAll(() => jest.resetAllMocks())

  it('should return an object of ENVs based off params', () => {

    const converted = convertParamsToEnvs(defArgs)

    expect(isObj(converted)).toBe(true)
    expect(converted.NODE_ENV).toBe('develop')
    expect(converted.KEG_EXEC_CMD).toBe('run')
    expect(converted.KEG_NM_INSTALL).toBe(true)
    expect(converted.KEG_COPY_LOCAL).toBe(true)
    
    const converted2 = convertParamsToEnvs({
      ...defArgs,
      install: false,
      command: 'duper'
    })

    expect(converted2.KEG_NM_INSTALL).toBe(undefined)
    expect(converted2.KEG_EXEC_CMD).toBe('duper')

  })


  testEnum(testArgs, convertParamsToEnvs)

})
