const proxyRoutes = [
  {
    entryPoints: [ 'keg' ],
    service: 'api@internal',
    rule: 'Host(`local.keghub.io`)',
    status: 'enabled',
    using: [ 'keg' ],
    name: 'api@docker',
    provider: 'docker'
  },
  {
    entryPoints: [ 'traefik' ],
    service: 'api@internal',
    rule: 'PathPrefix(`/api`)',
    priority: 2147483646,
    status: 'enabled',
    using: [ 'traefik' ],
    name: 'api@internal',
    provider: 'internal'
  },
  {
    entryPoints: [ 'keg' ],
    service: 'components-test-proxy-route',
    rule: 'Host(`components-test-proxy-route.local.keghub.io`)',
    status: 'enabled',
    using: [ 'keg' ],
    name: 'components-test-proxy-route@docker',
    provider: 'docker'
  },
  {
    entryPoints: [ 'traefik' ],
    middlewares: [ 'dashboard_redirect@internal', 'dashboard_stripprefix@internal' ],
    service: 'dashboard@internal',
    rule: 'PathPrefix(`/`)',
    priority: 2147483645,
    status: 'enabled',
    using: [ 'traefik' ],
    name: 'dashboard@internal',
    provider: 'internal'
  },
  {
    entryPoints: [ 'keg' ],
    service: 'evf-test-proxy-route',
    rule: 'Host(`evf-test-proxy-route.local.keghub.io`)',
    status: 'enabled',
    using: [ 'keg' ],
    name: 'evf-test-proxy-route@docker',
    provider: 'docker'
  },
  {
    entryPoints: [ 'traefik' ],
    service: 'ping@internal',
    rule: 'PathPrefix(`/ping`)',
    priority: 2147483647,
    status: 'enabled',
    using: [ 'traefik' ],
    name: 'ping@internal',
    provider: 'internal'
  },
  {
    entryPoints: [ 'keg' ],
    service: 'retheme-test-proxy-route',
    rule: 'Host(`retheme-test-proxy-route.local.keghub.io`)',
    status: 'enabled',
    using: [ 'keg' ],
    name: 'retheme-test-proxy-route@docker',
    provider: 'docker'
  }
]

module.exports = {
  proxyRoutes
}