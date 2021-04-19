jest.resetAllMocks()
jest.clearAllMocks()

const testKegConfig = {}
const testTask = {
  task: {
    name: 'test',
    options: {},
    action: jest.fn()
  },
  options: [
    'test:test',
    '--other option'
  ]
}

const findTaskMock = jest.fn(() => (testTask))
const getTaskDefinitionsMock = jest.fn(() => {})
const argsParseMock = jest.fn(() => ({ test: 'test', other: 'option' }))
const getKegGlobalConfigMock = jest.fn(() => (testKegConfig))

jest.setMock('../task/findTask', { findTask: findTaskMock })
jest.setMock('@keg-hub/args-parse', { argsParse: argsParseMock })
jest.setMock('../tasks', { getTaskDefinitions: getTaskDefinitionsMock })
jest.setMock('../task/getKegGlobalConfig', { getKegGlobalConfig: getKegGlobalConfigMock })

const { runTask } = require('../runTask')

describe('RunTask', () => {

  beforeEach(() => {
    findTaskMock.mockClear()
    argsParseMock.mockClear()
    testTask.task.action.mockClear()
    getTaskDefinitionsMock.mockClear()
    // getKegGlobalConfigMock.mockClear()
  })

  test('Should export a runTask method', () => {
    expect(typeof runTask).toBe('function')
  })

  test('Should not automatically call runTask when imported ', () => {
    // runTask calls getKegGlobalConfig method, so we mock it and check if it was called
    // If it was not, then runTask was not called
    expect(getKegGlobalConfigMock).not.toHaveBeenCalled()
    const { runTask } = require('../runTask')
    expect(getKegGlobalConfigMock).not.toHaveBeenCalled()
  })

  test('Should try to load the keg global config', async () => {
    await runTask()
    expect(getKegGlobalConfigMock).toHaveBeenCalled()
  })

  test('Should try to find the correct task', async () => {
    expect(findTaskMock).not.toHaveBeenCalled()
    await runTask()
    expect(findTaskMock).toHaveBeenCalled()
  })

  test('Should try to parse the passed in options into params', async () => {
    expect(argsParseMock).not.toHaveBeenCalled()
    await runTask()
    expect(argsParseMock).toHaveBeenCalled()
  })

  test('Should call the tasks action', async () => {
    expect(testTask.task.action).not.toHaveBeenCalled()
    await runTask()
    expect(testTask.task.action).toHaveBeenCalled()
  })

})