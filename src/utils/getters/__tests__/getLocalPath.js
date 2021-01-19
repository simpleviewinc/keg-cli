const path = require('path')
const { DOCKER } = require('KegConst/docker')
const { get } = require('@keg-hub/jsutils')
const globalConfig = global.getGlobalCliConfig()
const cliRootDir = global.cliRootDir

const { getLocalPath } = require('../getLocalPath')

describe('getLocalPath', () => {

  afterAll(() => jest.resetAllMocks())

  it('should get the local path from the local when passed in', async () => {

    const localPath = getLocalPath(globalConfig, 'test', 'foo.bar', 'local-path-test')
    expect(localPath).toBe('local-path-test')

  })

  it('should get the local path from the context and dependency', async () => {

    const localPath = getLocalPath(globalConfig, 'core', 'cli')
    expect(path.resolve(localPath)).toBe(path.resolve(get(DOCKER, `CONTAINERS.CORE.ENV.CLI_PATH`)))

  })

  it('should return the current working directory when no path is found', async () => {
    const localPath = getLocalPath(globalConfig, 'core', 'foo')
    expect(path.resolve(localPath)).toBe(path.resolve(cliRootDir))

  })

})
