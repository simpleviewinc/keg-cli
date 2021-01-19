const globalConfig = global.getGlobalCliConfig()

const { DOCKER } = require('KegConst/docker')
const { get } = require('@keg-hub/jsutils')
const testTask = global.getTask()
const unloadEnvs = global.loadMockEnvs()

const { buildContainerContext } = require('../buildContainerContext')

describe('buildContainerContext', () => {

  afterAll(() => {
    jest.resetAllMocks()
    unloadEnvs()
  })

  it('should return an object with keys cmdContext, contextEnvs, location, and tap', async () => {

    const res = await buildContainerContext({
      globalConfig,
      params: { context: 'base' },
      task: testTask,
      envs: {},
    })

    const resKeys = Object.keys(res)
    const keys = [
      'cmdContext',
      'contextEnvs',
      'location',
      'tap',
      'image',
      'withPrefix',
      'noPrefix',
    ]

    keys.map(key => { expect(resKeys.indexOf(key)).not.toBe(-1) })

  })

  it('should return the contextEnvs for the base context', async () => {

    const { contextEnvs } = await buildContainerContext({
      globalConfig,
      params: { context: 'base' },
      task: testTask,
      envs: {},
    })

    expect(contextEnvs.KEG_CONTEXT_PATH)
      .toBe(get(DOCKER, `CONTAINERS.BASE.ENV.KEG_CONTEXT_PATH`))

    expect(contextEnvs.KEG_DOCKER_FILE)
      .toBe(get(DOCKER, `CONTAINERS.BASE.ENV.KEG_DOCKER_FILE`))

    expect(contextEnvs.KEG_VALUES_FILE)
      .toBe(get(DOCKER, `CONTAINERS.BASE.ENV.KEG_VALUES_FILE`))

    expect(contextEnvs.KEG_COMPOSE_DEFAULT)
      .toBe(get(DOCKER, `CONTAINERS.BASE.ENV.KEG_COMPOSE_DEFAULT`))

    expect(contextEnvs.IMAGE).toBe('keg-base')
    expect(contextEnvs.VERSION).toBe('0.0.1')
    expect(contextEnvs.CONTAINER_NAME).toBe('keg-base')

  })


  it('should return the contextEnvs for the core context', async () => {

    const { contextEnvs } = await buildContainerContext({
      globalConfig,
      params: { context: 'core' },
      task: testTask,
      envs: {},
    })

    expect(contextEnvs.KEG_CONTEXT_PATH)
      .toBe(get(DOCKER, `CONTAINERS.CORE.ENV.KEG_CONTEXT_PATH`))

    expect(contextEnvs.KEG_DOCKER_FILE)
      .toBe(get(DOCKER, `CONTAINERS.CORE.ENV.KEG_DOCKER_FILE`))

    expect(contextEnvs.KEG_VALUES_FILE)
      .toBe(get(DOCKER, `CONTAINERS.CORE.ENV.KEG_VALUES_FILE`))

    expect(contextEnvs.KEG_COMPOSE_DEFAULT)
      .toBe(get(DOCKER, `CONTAINERS.CORE.ENV.KEG_COMPOSE_DEFAULT`))

    expect(contextEnvs.IMAGE).toBe('keg-core')
    expect(contextEnvs.VERSION).toBe('0.0.1')
    expect(contextEnvs.CONTAINER_NAME).toBe('keg-core')

  })

  it('should return the contextEnvs for the components context', async () => {

    const { contextEnvs } = await buildContainerContext({
      globalConfig,
      params: { context: 'components' },
      task: testTask,
      envs: {},
    })

    expect(contextEnvs.KEG_CONTEXT_PATH)
      .toBe(get(DOCKER, `CONTAINERS.COMPONENTS.ENV.KEG_CONTEXT_PATH`))

    expect(contextEnvs.KEG_DOCKER_FILE)
      .toBe(get(DOCKER, `CONTAINERS.COMPONENTS.ENV.KEG_DOCKER_FILE`))

    expect(contextEnvs.KEG_VALUES_FILE)
      .toBe(get(DOCKER, `CONTAINERS.COMPONENTS.ENV.KEG_VALUES_FILE`))

    expect(contextEnvs.KEG_COMPOSE_DEFAULT)
      .toBe(get(DOCKER, `CONTAINERS.COMPONENTS.ENV.KEG_COMPOSE_DEFAULT`))

    expect(contextEnvs.IMAGE).toBe('keg-components')
    expect(contextEnvs.VERSION).toBe('0.0.1')
    expect(contextEnvs.CONTAINER_NAME).toBe('keg-components')

  })


})
