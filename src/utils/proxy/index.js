module.exports = {
  ...require('./filterProxyRoutes'),
  ...require('./generateComposeLabels'),
  ...require('./getProxyDomainFromBranch'),
  ...require('./getProxyDomainFromLabel'),
  ...require('./getProxyRoutes'),
}