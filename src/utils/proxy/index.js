module.exports = {
  ...require('./generateComposeLabels'),
  ...require('./getProxyDomainFromBranch'),
  ...require('./getProxyDomainFromLabel'),
  ...require('./getTapProxyName'),
  ...require('./startTapProxy'),
}