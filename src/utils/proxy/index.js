module.exports = {
  ...require('./getProxyDomainFromBranch'),
  ...require('./getProxyDomainFromEnv')
  ...require('./getTapProxyName'),
  ...require('./startTapProxy'),
}