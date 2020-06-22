module.exports = {
  ...require('./addProviderTags'),
  ...require('./buildProviderUrl'),
  ...require('./buildDockerCmd'),
  ...require('./buildDockerMounts'),
  ...require('./compose'),
  ...require('./containerSelect'),
  ...require('./getBuildArgs'),
  ...require('./getBuildTags'),
  ...require('./getContainerConst'),
  ...require('./getDockerArgs'),
  ...require('./getOrBuildImage'),
  ...require('./imageSelect'),
}