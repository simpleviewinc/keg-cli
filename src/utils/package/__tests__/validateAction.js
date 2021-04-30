const { testEnum } = require('KegMocks/jest/testEnum')

const generalErrorMock = jest.fn()
jest.setMock('KegUtils/error/generalError', { generalError: generalErrorMock })

const throwMissingActionMock = jest.fn()
jest.setMock('KegUtils/error/throwMissingAction', { throwMissingAction: throwMissingActionMock })

const inputs = {
  first: [{}, 'no.exists'],
  second: [{ does: { exist: { cmds: [ 'test' ] } } }, 'does.exist'],
  third: [ {}, { cmds: [ 'action-object' ] } ],
  fourth: [{ no: { commands: {} } }, 'no.commands'],
  fifth: [{ has: { onlyCmd: { cmd: 'only-cmd' } } }, 'has.onlyCmd']
}

const testArgs = {
  throwNoAction: {
    description: 'Should throw when no action can be found in the actions object',
    inputs: inputs.first,
    outputs: () => expect(throwMissingActionMock).toHaveBeenCalled()
  },
  noThrowOnAction: {
    description: 'Should not throw when the action can be found in the actions object',
    inputs: inputs.second,
    outputs: () => expect(throwMissingActionMock).not.toHaveBeenCalled()
  },
  returnAction: {
    description: 'Should return the action when its found',
    inputs: inputs.second,
    outputs: resp => expect(resp).toBe(inputs.second[0].does.exist)
  },
  allowUndefined: {
    description: 'Should not throw when allowUndefined is true and no action is found',
    inputs: [ ...inputs.first, true ],
    outputs: () => expect(throwMissingActionMock).not.toHaveBeenCalled()
  },
  returnFalse: {
    description: 'Should return false when allowUndefined is true and no action is found',
    inputs: [ ...inputs.first, true ],
    outputs: resp => expect(resp).toBe(false)
  },
  allowActionObject: {
    description: 'Should return the action when its passed as an object',
    inputs: inputs.third,
    outputs: resp => expect(resp).toBe(inputs.third[1])
  },
  throwOnNoCmds: {
    description: 'Should thrown when the action is found, but it does not have cmds',
    inputs: inputs.fourth,
    outputs: () => expect(generalErrorMock).toHaveBeenCalled()
  },
  worksWithCmd: {
    description: 'Should not thrown when the action has the cmd property',
    inputs: inputs.fifth,
    outputs: () => expect(generalErrorMock).not.toHaveBeenCalled()
  },
}

const { validateAction } = require('../validateAction')

describe('validateAction', () => {
  beforeEach(() => {
    generalErrorMock.mockClear()
    throwMissingActionMock.mockClear()
  })
  afterAll(() => jest.resetAllMocks())
  testEnum(testArgs, validateAction)
})