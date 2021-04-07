const { getOptsWithLabels } = require('../getOptsWithLabels')

// mocked using moduleNameMapper in jest config
const { KEG_ENVS } = require('KegConst/envs')

const mockData = {
  builtOpts: [
    '-it',
  ],
  imgLabels: {
    'com.keg.proxy.domain': 'mock-ZEN-550',
  }
}

describe('updateLabels', () => {
  it('should add the label to the options', () => {
    const subdomain = mockData.imgLabels['com.keg.proxy.domain']
    const domain = KEG_ENVS.KEG_PROXY_HOST
    const result = getOptsWithLabels(subdomain, mockData.builtOpts).builtOpts

    const label = `--label "traefik.http.routers.${subdomain}.rule=Host(\`${subdomain}.${domain}\`)"`

    expect(result).toEqual(expect.arrayContaining([label]))
  })

  it ('should return the fully proxy url', () => {
    const subdomain = mockData.imgLabels['com.keg.proxy.domain']
    const domain = KEG_ENVS.KEG_PROXY_HOST
    const expected = `${subdomain}.${domain}`
    const url = getOptsWithLabels(subdomain, mockData.builtOpts).fullProxyUrl
    expect(url).toEqual(expected)
  })
})

