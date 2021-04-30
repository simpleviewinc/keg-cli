const { testEnum } = require('KegMocks/jest/testEnum')

const actionMock = {}
const validateActionMock = jest.fn((actions, action) => {
  return action === 'NO_RETURN'
    ? false
    : actionMock
})
jest.setMock('../validateAction', { validateAction: validateActionMock })
const runActionCmdsMock = jest.fn()
jest.setMock('KegUtils/actions/runActionCmds', { runActionCmds: runActionCmdsMock })
const getActionsMock = jest.fn()
jest.setMock('KegUtils/actions/getActionsFromValues', { getActionsFromValues: getActionsMock })


const inputs = {
  first: [
    `container-test-1`,
    {},
    {},
  ],
  second: [
    `container-test-2`,
    { params: { action: 'action.override' } },
    {},
  ],
  third: [
    `container-test-3`,
    { params: { action: 'NO_RETURN' } },
    {},
  ]
}

const testArgs = {
  getActionsFromValues: {
    description: 'Calls the getActionsFromValues method',
    inputs: inputs.first,
    outputs: () => expect(getActionsMock).toHaveBeenCalled()
  },
  validateAction: {
    description: 'Calls the validateAction method',
    inputs: inputs.first,
    outputs: () => expect(validateActionMock).toHaveBeenCalled()
  },
  defaultBuildAction: {
    description: 'Calls the validateAction method',
    inputs: inputs.first,
    outputs: () => {
      expect(validateActionMock.mock.calls[0][1]).toBe('tap.build')
    }
  },
  actionOverridesDefault: {
    description: 'Passed in action overrides the default action',
    inputs: inputs.second,
    outputs: () => {
      expect(validateActionMock.mock.calls[0][1]).toBe('action.override')
    }
  },
  runAction: {
    description: 'Calls runActionCmds when it has a valid action',
    inputs: inputs.first,
    outputs: () => expect(runActionCmdsMock).toHaveBeenCalled()
  },
  noRunAction: {
    description: 'Does not call runActionCmds when action is invalid',
    inputs: inputs.third,
    outputs: () => expect(runActionCmdsMock).not.toHaveBeenCalled()
  },
}

const { runBuildAction } = require('../runBuildAction')

describe('runBuildAction', () => {
  beforeEach(() => {
    getActionsMock.mockClear()
    runActionCmdsMock.mockClear()
    validateActionMock.mockClear()
  })
  afterAll(() => jest.resetAllMocks())
  testEnum(testArgs, runBuildAction)
})