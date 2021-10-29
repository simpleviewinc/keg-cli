jest.resetModules()
jest.resetAllMocks()
jest.clearAllMocks()

const spawnCmdMock = jest.fn()
const asyncCmdMock = jest.fn()
jest.setMock('@keg-hub/spawn-cmd', { spawnCmd: spawnCmdMock, asyncCmd: asyncCmdMock })
const errorLogMock = jest.fn()
jest.setMock('../../logger/logger', { Logger: { error: errorLogMock }})

let testInDocker = false
const inDockerdMock = jest.fn(() => {
  return testInDocker
})
jest.setMock('../inDocker', { inDocker: inDockerdMock })

const {
  runCmd,
  execCmd,
  spawnCmd,
  inDocker,
  dockerCmd,
  dockerExec,
  ...shortcutCmds
} = require('../commands')
  
describe('commands', () => {

  beforeEach(() => {
    spawnCmdMock.mockClear()
    asyncCmdMock.mockClear()
    errorLogMock.mockClear()
    inDockerdMock.mockClear()
  })

  describe('runCmd', () => {

    it(`Should call asyncCmd when asExec is true`, async () => {
      await runCmd('test', [], {}, process.cwd(), true)
      expect(asyncCmdMock).toHaveBeenCalled()
    })

    it(`Should not call asyncCmd when isExec is false`, async () => {
      await runCmd('test', [], {}, process.cwd(), false)
      expect(asyncCmdMock).not.toHaveBeenCalled()
    })

    it(`Should call asyncCmd when exec is true`, async () => {
      await runCmd('test', [], { exec: true }, process.cwd())
      expect(asyncCmdMock).toHaveBeenCalled()
    })

    it(`Should not call asyncCmd when exec is false`, async () => {
      await runCmd('test', [], { exec: false }, process.cwd())
      expect(asyncCmdMock).not.toHaveBeenCalled()
    })

    it(`Should convert the cmd and args into a string when calling exec command`, async () => {
      await runCmd('test', [ '--arg', '1' ], { exec: true }, process.cwd())
      expect(typeof asyncCmdMock.mock.calls[0][0]).toBe('string')
      const args = asyncCmdMock.mock.calls[0][0].split(' ')
      expect(args[0]).toBe('test')
      expect(args[1]).toBe('--arg')
      expect(args[2]).toBe('1')
    })

    it(`Should not convert the cmd and args into a string when exec is false`, async () => {
      const args = [ '--arg', '1' ]
      await runCmd('test', args, {}, process.cwd())
      expect(spawnCmdMock.mock.calls[0][0]).toBe('test')
      expect(spawnCmdMock.mock.calls[0][1].args).toEqual(args)
    })

    it(`Should pass the event callbacks to the config`, async () => {
      const options = {
        onStdOut: jest.fn(),
        onStdErr: jest.fn(),
        onError: jest.fn(),
        onExit: jest.fn(),
      }
      await runCmd('test', [], options, process.cwd())

      const callConf = spawnCmdMock.mock.calls[0][1]
      expect(callConf.onStdOut).toBe(options.onStdOut)
      expect(callConf.onStdErr).toBe(options.onStdErr)
      expect(callConf.onError).toBe(options.onError)
      expect(callConf.onExit).toBe(options.onExit)

    })

    it(`Should join the options.env with process.env`, async () => {
      process.env.TEST_CLI_UTILS_PROC_ENV = `process.env`
      await runCmd('test', [], { env: { TEST_OPT_ENV: 'option.env' } }, process.cwd())
      const callOpts = spawnCmdMock.mock.calls[0][1].options
      expect(callOpts.env.TEST_CLI_UTILS_PROC_ENV).toBe(`process.env`)
      expect(callOpts.env.TEST_OPT_ENV).toBe('option.env')
    })

  })

  describe('dockerCmd', () => {
    it(`Should call inDocker method`, async () => {
      await dockerCmd('container-id', [ 'yarn', 'install' ], {}, process.cwd(), true)
      expect(inDockerdMock).toHaveBeenCalled()
    })

    it(`Should include container-id method when not in docker`, async () => {
      await dockerCmd('container-id', [ 'yarn', 'install' ], {}, process.cwd(), true)
      expect(asyncCmdMock.mock.calls[0][0]).toBe(`docker exec -it container-id yarn install`)
    })

    it(`Should not include container-id method when is in docker`, async () => {
      testInDocker = true
      await dockerCmd('container-id', [ 'yarn', 'install'], {}, process.cwd(), true)
      expect(asyncCmdMock.mock.calls[0][0]).toBe(`yarn install`)
    })
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