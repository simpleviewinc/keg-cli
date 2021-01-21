const { getComposeServiceName } = require('../getComposeServiceName')

describe('getComposeServiceName', () => {

  afterAll(() => jest.resetAllMocks())

  it('Should return the KEG_COMPOSE_SERVICE env when its passed in the contextEnvs', async () => {
    const serviceName = getComposeServiceName('', { KEG_COMPOSE_SERVICE: 'test' })
    expect(serviceName).toBe('test')
  })

  it('Should return the IMAGE env when no KEG_COMPOSE_SERVICE env is passed in', async () => {
    const serviceName = getComposeServiceName('', { IMAGE: 'image-test' })
    expect(serviceName).toBe('image-test')
  })

  it('Should return the cmdContext when neither KEG_COMPOSE_SERVICE or IMAGE is passed in', async () => {
    const serviceName = getComposeServiceName('cmd-context-test', {})
    expect(serviceName).toBe('cmd-context-test')
  })

  it('Should return the KEG_COMPOSE_SERVICE env over all other options', async () => {
    const serviceName = getComposeServiceName('cmd-context-test', { KEG_COMPOSE_SERVICE: 'test', IMAGE: 'image-test' })
    expect(serviceName).toBe('test')
  })

  it('Should return the IMAGE env over cmdContext option', async () => {
    const serviceName = getComposeServiceName('cmd-context-test', { IMAGE: 'image-test' })
    expect(serviceName).toBe('image-test')
  })

})