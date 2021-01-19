
const globalConfig = global.getGlobalCliConfig()
const { __updateGlobalConfig } = require('../../globalConfig/globalConfigCache')
__updateGlobalConfig(globalConfig)

const { DOCKER } = require('KegConst/docker')
const { get } = require('@keg-hub/jsutils')
const testTask = global.getTask()
const unloadEnvs = global.loadMockEnvs()

const { buildContextEnvs } = require('../buildContextEnvs')

describe('buildContextEnvs', () => {

  afterAll(() => {
    jest.resetAllMocks()
    unloadEnvs()
  })
  
  it('Should build the container context envs for the base container', async () => {

    const contextEnvs = await buildContextEnvs({
        globalConfig,
        params: { context: 'base' },
        task: testTask,
        envs: {},
        cmdContext: 'base',
        tap: false
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

  it('Should build the container context envs for the tap container', async () => {

    const contextEnvs = await buildContextEnvs({
        globalConfig,
        params: { context: 'tap', tap: 'test' },
        task: testTask,
        envs: {},
        cmdContext: 'tap',
      })

      expect(contextEnvs.KEG_CONTEXT_PATH)
        .toBe(get(DOCKER, `CONTAINERS.TAP.ENV.KEG_CONTEXT_PATH`))

      expect(contextEnvs.KEG_DOCKER_FILE)
        .toBe(get(DOCKER, `CONTAINERS.TAP.ENV.KEG_DOCKER_FILE`))

      expect(contextEnvs.KEG_VALUES_FILE)
        .toBe(get(DOCKER, `CONTAINERS.TAP.ENV.KEG_VALUES_FILE`))

      expect(contextEnvs.KEG_COMPOSE_DEFAULT)
        .toBe(get(DOCKER, `CONTAINERS.TAP.ENV.KEG_COMPOSE_DEFAULT`))

      expect(contextEnvs.IMAGE).toBe('tap')
      expect(contextEnvs.VERSION).toBe('0.0.1')
      expect(contextEnvs.CONTAINER_NAME).toBe('tap')

    })

})