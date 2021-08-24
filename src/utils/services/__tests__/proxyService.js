const { docker } = require('KegMocks/libs/docker')
const globalConfig = global.getGlobalCliConfig()

jest.setMock('KegDocCli', docker)

const internalTaskMock = jest.fn(args => {
  return args
})

jest.setMock('KegUtils/task/runInternalTask', { runInternalTask: internalTaskMock })

const { proxyService } = require('../proxyService')

describe('proxyService', () => {

  beforeEach(() => {
    docker.container.exists.mockClear()
    internalTaskMock.mockClear()
  })

  afterAll(() => jest.resetAllMocks())

  // TODO: {TAP-PROXY} Update to use tap-proxy from globalConfig settings
  // Remove hard coded tap-proxy references, replace with value from globalConfig settings
  it('It checks if the proxy container exists', async () => {
    await proxyService({ globalConfig, params: {} })
    expect(docker.container.get).toHaveBeenCalled()
    expect(docker.container.get.mock.calls[0][0]).toBe('tap-proxy')
  })

  it(`calls task to start the proxy if it does not exist`, async () => {
    await proxyService({ globalConfig, params: {} })
    expect(internalTaskMock).toHaveBeenCalled()
    expect(internalTaskMock.mock.calls[0][0]).toBe('proxy.tasks.start')
  })

  it(`does not call the proxy start task when the container already exists`, async () => {
    global.testDocker.containers[`tap-proxy`] = { state: 'running' }
    await proxyService({ globalConfig, params: {} })
    expect(internalTaskMock).not.toHaveBeenCalled()
    delete global.testDocker.containers[`tap-proxy`]
  })

})
