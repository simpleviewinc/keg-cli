const { getOptsWithLabels } = require('../labelHelpers')

const mockData = {
  proxyUrl: false,
  fullProxyUrl: 'mock-container.local.kegdev.xyz',
  builtOpts: [
    '-it',
  ],
  imgLabels: {
    'com.keg.env.cmd': 'start',
    'com.keg.env.context': 'mock',
    'com.keg.env.port': '3000',
    'com.keg.proxy.domain': 'mock-ZEN-550',
    'com.keg.path.compose': '/keg-hub/taps/keg-test-mock/container/docker-compose.yml',
    'com.keg.path.container': '/keg/app',
    'com.keg.path.context': '/keg-hub/taps/keg-test-mock',
    'com.keg.path.docker': '/keg-hub/taps/keg-test-mock/container/Dockerfile',
    'com.keg.path.values': '/keg-hub/taps/keg-test-mock/container/values.yml',
    'org.opencontainers.image.source': 'https://github.com/simpleviewinc/keg-test-mock.git'
  }
}

describe('updateLabels', () => {
  it('should add the label to the options', () => {
    const subdomain = mockData.imgLabels['com.keg.proxy.domain']
    const domain = 'myEnv.myDomain.io'
    const result = getOptsWithLabels(subdomain, domain, ['-it']).builtOpts

    const label = `--label "traefik.http.routers.${subdomain}.rule=Host(\`${subdomain}.${domain}\`)"`

    expect(result).toEqual(expect.arrayContaining([label]))
  })
})

