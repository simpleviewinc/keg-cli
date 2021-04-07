jest.resetModules()
jest.resetAllMocks()
jest.clearAllMocks()

const path = require('path')
const mocksPath = path.join(__dirname, '../../../__mocks__')
const { Logger } = require(mocksPath)
jest.setMock('../../logger/logger', { Logger })

const {
  throwError,
  throwExitError,
  throwNoAction,
  throwTaskFailed,
} = require('../error')

oldExit = process.exit
process.exit = jest.fn()

describe('Errors', () => {

  beforeEach(() => {
    process.exit.mockClear()
  })

  afterAll(() => {
    process.exit = oldExit
  })

  test('throwError should throw an error', () => {
    expect(() => {
      throwError()
    }).toThrow()
  })

  test('throwNoAction should throw an error', () => {
    expect(() => {
      throwNoAction({})
    }).toThrow()
  })

  test('throwNoAction should throw an error', () => {
    expect(() => {
      throwTaskFailed()
    }).toThrow()
  })

  test('throwExitError should call process.exit', () => {
    expect(process.exit).not.toHaveBeenCalled()
    throwExitError()
    expect(process.exit).toHaveBeenCalled()
  })

})
