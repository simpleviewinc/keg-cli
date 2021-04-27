jest.resetModules()
jest.resetAllMocks()
jest.clearAllMocks()

const spawnCmdMock = jest.fn()
const asyncCmdMock = jest.fn()
jest.setMock('@keg-hub/spawn-cmd', { spawnCmd: spawnCmdMock, asyncCmd: asyncCmdMock })
const errorLogMock = jest.fn()
jest.setMock('../../logger/logger', { Logger: { error: errorLogMock }})

const {
  runCmd,
  execCmd,
  spawnCmd,
  dockerExec,
  ...shortcutCmds
} = require('../commands')
  
describe('commands', () => {

  beforeEach(() => {
    spawnCmdMock.mockClear()
    errorLogMock.mockClear()
  })

  Object.entries(shortcutCmds).map(([ key, method ]) => {
    const name = key === 'dockerCompose' ? 'docker-compose' : key

    describe(`${name} method`, () => {

      beforeEach(() => {
        spawnCmdMock.mockClear()
        errorLogMock.mockClear()
      })

      it('should be a function', () => {
        expect(typeof method).toBe('function')
      })

      it(`should call spawnCmd with ${name} as the first argument`, async () => {
        expect(spawnCmdMock).not.toHaveBeenCalled()
        await method()
        expect(spawnCmdMock).toHaveBeenCalled()
        expect(spawnCmdMock.mock.calls[0][0]).toBe(name)
      })

      it('should accept an array of args as the first argument', async () => {
        await method(['exec', '-d'])
        expect(spawnCmdMock.mock.calls[0][1].args).toEqual(['exec', '-d'])
      })

      it('should accept a string as the first argument, and convert it to an array', async () => {
        await method('exec -d')
        expect(spawnCmdMock.mock.calls[0][1].args).toEqual(['exec', '-d'])
      })

      it('should accept an options object as the second argument', async () => {
        await method([], { test: 'this is test' })
        expect(spawnCmdMock.mock.calls[0][1].options.test).toEqual('this is test')
      })

      it('should pass on the options.env object merged with the process.env', async () => {
        process.env['OTHER_TEST_ENV'] = 'other-test-env'
        process.env['TEST_ENV'] = 'should-be-overridden'
        await method([], { env: { TEST_ENV: 'test-env' } })
        expect(spawnCmdMock.mock.calls[0][1].options.env.OTHER_TEST_ENV).toBe('other-test-env')
        expect(spawnCmdMock.mock.calls[0][1].options.env.TEST_ENV).toBe('test-env')
      })

      it('should accept a path as the third argument and use it as the cwd', async () => {
        await method([], {}, '/test/custom/path')
        expect(spawnCmdMock.mock.calls[0][1].cwd).toBe('/test/custom/path')
      })

      it('should accept undefined args, but defined options', async done => {
        expect(async () => {
          await method(undefined, {})
          done()
        }).not.toThrow()
      })

      it('should accept undefined args and options, but defined cwd', async done => {
        expect(async () => {
          await method(undefined, undefined, '/custom/test/path')
          done()
        }).not.toThrow()
      })

      it('should log a warning if args exists but not an array, string, or falsy', async () => {
        expect(errorLogMock).not.toHaveBeenCalled()
        await method({})
        expect(errorLogMock).toHaveBeenCalled()
      })

    })

  })


})