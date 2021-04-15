const { getOptsWithProxyRule } = require('../getOptsWithProxyRule')
const { testEnum } = require('KegMocks/jest/testEnum')
const { kegLabelKeys } = require('KegConst/docker/labels')

// mocked using moduleNameMapper in jest config
const { KEG_ENVS } = require('KegConst/envs')


const mockData = {
  builtOpts: [
    '-it',
  ],
  imgLabels: {
    // 'com.keg.proxy.domain': 'mock-ZEN-550',
    [kegLabelKeys.KEG_PROXY_DOMAIN]: 'mock-ZEN-550',
  }
}

describe('updateLabels', () => {
  const subdomain = mockData.imgLabels[kegLabelKeys.KEG_PROXY_DOMAIN]
  const domain = KEG_ENVS.KEG_PROXY_HOST

  it('should add the label to the options', () => {
    const opts = getOptsWithProxyRule(subdomain, mockData.builtOpts).builtOpts
    const label = `--label "traefik.http.routers.${subdomain}.rule=Host(\`${subdomain}.${domain}\`)"`
    expect(opts).toEqual(expect.arrayContaining([label]))
  })

  it ('should return the fully proxy url', () => {
    const expected = `${subdomain}.${domain}`
    const url = getOptsWithProxyRule(subdomain, mockData.builtOpts).fullProxyUrl
    expect(url).toEqual(expected)
  })
})

