const { checkArgsForEnv } = require('../checkArgsForEnv')

let orgArgv = process.argv

describe('checkArgsForEnv', () => {

  beforeAll(() => {
    jest.resetAllMocks()
  })

  afterAll(() => {
    jest.resetAllMocks()
    process.argv = orgArgv
  })

  it('should return the correct env from process.argv', () =>{
    process.argv = [1, 2, 'test', '--option', '-e', 'test']
    expect(checkArgsForEnv()).toBe('test')

    process.argv = [1, 2, 'task', '--env', 'production', 'item=thing']
    expect(checkArgsForEnv()).toBe('production')

    process.argv = [1, 2, 'task', '--thing', 'item=other', '--environment', 'staging', 'end']
    expect(checkArgsForEnv()).toBe('staging')

    process.argv = [1, 2, 'task', 'env=development', '-o']
    expect(checkArgsForEnv()).toBe('development')
  })

  it('should return false for invalid env', () =>{
    process.argv = [1, 2, 'test', '--option', '-e', 'invalid']
    expect(checkArgsForEnv()).toBe(false)

    process.argv = [1, 2, 'task', '--env', 'duper', 'item=thing']
    expect(checkArgsForEnv()).toBe(false)

    process.argv = [1, 2, 'task', '--thing', 'item=other', '--environment', 'OMG', 'end']
    expect(checkArgsForEnv()).toBe(false)

    process.argv = [1, 2, 'task', 'env=not-correct', '-o']
    expect(checkArgsForEnv()).toBe(false)
  })

  it('should return false when no env exist in the argument', () =>{
    process.argv = [1, 2, 'test', '--option', 'no-env']
    expect(checkArgsForEnv()).toBe(false)

    process.argv = [1, 2, 'task', 'env', 'duper', 'item=thing']
    expect(checkArgsForEnv()).toBe(false)

    process.argv = [1, 2, 'task', '--thing', 'item=other', 'OMG', 'end']
    expect(checkArgsForEnv()).toBe(false)

    process.argv = [1, 2, 'task', 'envt=not-correct', '-o']
    expect(checkArgsForEnv()).toBe(false)
  })

})