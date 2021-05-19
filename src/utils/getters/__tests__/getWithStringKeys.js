
const testObj = {
  config: {
    Labels: {
      'com.keg.env.cmd': 'sb',
      'com.keg.env.context': 'retheme',
      'com.keg.env.port': {
        'another.sub.string': 'some-value'
      },
      'com.keg.path.compose': 're-theme/container/docker-compose.yml',
      'com.keg.path.container': '/keg/tap',
      'com.keg.path.context': 're-theme',
      'com.keg.path.docker': 're-theme/container/Dockerfile',
      'com.keg.path.values': 're-theme/container/values.yml'
    }
  },
  env: [
    'KEG_PROXY_PORT=6701',
    { 'test.dot.sub': { 'another.level': 'found-value' }}
  ]
}

const { getWithStringKeys } = require('../getWithStringKeys')

describe('getWithStringKeys', () => {

  afterAll(() => jest.resetAllMocks())

  it('should get a sub path of an object', () => {
    expect(getWithStringKeys(testObj, `config.Labels`)).toBe(testObj.config.Labels)
    expect(getWithStringKeys(testObj, `env.0`)).toBe(testObj.env[0])
  })

  it('should get a sub path of an object even when keys have a . in them', () => {
    expect(getWithStringKeys(testObj, `config.Labels.com.keg.env.port`))
      .toBe(testObj.config.Labels['com.keg.env.port'])

    expect(getWithStringKeys(testObj, `config.Labels.com.keg.env.port.another.sub.string`))
      .toBe(testObj.config.Labels['com.keg.env.port']['another.sub.string'])

      expect(getWithStringKeys(testObj, `env.1.test.dot.sub.another.level`))
        .toBe(testObj.env[1]['test.dot.sub']['another.level'])
  })

  it('should return undefined for non-existing key paths', () => {
    expect(getWithStringKeys(testObj, `config.Test`)).toBe(undefined)
    expect(getWithStringKeys(testObj, `config.Labels.noExists`)).toBe(undefined)
    expect(getWithStringKeys(testObj, `config.Labels.com.keg.empty`)).toBe(undefined)
  })

})