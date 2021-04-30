const { testEnum } = require('KegMocks/jest/testEnum')
const globalConfig = global.getGlobalCliConfig()

const runInternalTaskMock = jest.fn()
jest.setMock('../../task/runInternalTask', { runInternalTask: runInternalTaskMock })

const buildExecParamsMock = jest.fn()
jest.setMock('../../docker/buildExecParams', { buildExecParams: buildExecParamsMock })

const inputs = {
  core: {
    args: {
      globalConfig,
      params: {
        context: 'core',
        image: 'keg-core',
      },
      options: [],
      cmd: 'test',
    },
    action: {
      cmd: 'echo "single cmd"'
    }
  },
  components: {
    args: {
      globalConfig,
      params: {
        context: 'components',
        image: 'keg-components',
      },
      options: [],
      cmd: 'test',
    },
    action: {
      cmds: [ 'echo "test"', "exit 0" ],
    }
  },
  extraCmdsAction: {
    cmd: 'extra cmd',
    cmds: [ 'echo "test"', "exit 0" ],
  }
}

const testArgs = {
  callBuildExecParam: {
    description: 'Calls the buildExecParams method',
    inputs: [inputs.components.args, inputs.components.action, 'components'],
    outputs: () => expect(buildExecParamsMock).toHaveBeenCalledTimes(2)
  },
  callInternalTask: {
    description: 'Calls the runInternalTask method',
    inputs: [inputs.components.args, inputs.components.action, 'components'],
    outputs: () => expect(runInternalTaskMock).toHaveBeenCalledTimes(2)
  },
  callAllCmds: {
    description: 'Calls the runInternalTask for each cmd of the action',
    inputs: [inputs.components.args, inputs.components.action, 'components'],
    outputs: () => {
      const first = runInternalTaskMock.mock.calls[0][1]
      expect(first.params.cmd).toEqual('echo "test"')

      const second = runInternalTaskMock.mock.calls[1][1]
      expect(second.params.cmd).toEqual("exit 0")
    }
  },
  workWithOnlyCmd: {
    description: 'Works when only passing a cmd property instead of a cmds property',
    inputs: [inputs.core.args, inputs.core.action, 'core'],
    outputs: () => {
      expect(buildExecParamsMock).toHaveBeenCalledTimes(1)
      expect(runInternalTaskMock).toHaveBeenCalledTimes(1)
      const first = runInternalTaskMock.mock.calls[0][1]
      expect(first.params.cmd).toEqual('echo "single cmd"')
    }
  },
  workWithCmdAndCmds: {
    description: 'Calls the cmd first, then each cmd in cmds array if both are passed',
    inputs: [inputs.core.args, inputs.extraCmdsAction, 'core'],
    outputs: () => {
      const first = runInternalTaskMock.mock.calls[0][1]
      const second = runInternalTaskMock.mock.calls[1][1]
      const third = runInternalTaskMock.mock.calls[2][1]
      expect(first.params.cmd).toEqual('extra cmd')
      expect(second.params.cmd).toEqual('echo "test"')
      expect(third.params.cmd).toEqual('exit 0')
    }
  },
}

const { runActionCmds } = require('../runActionCmds')

describe('runActionCmds', () => {
  beforeEach(() => {
    runInternalTaskMock.mockClear()
    buildExecParamsMock.mockClear()
  })
  afterAll(() => jest.resetAllMocks())
  testEnum(testArgs, runActionCmds)
})