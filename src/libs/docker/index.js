module.exports = {
  ...require('./buildDockerCmd'),
  ...require('./dockerError'),
  ...require('./getBuildArgs'),
  ...require('./getBuildTags'),
  ...require('./getDockerArgs'),
  ...require('./getDirsToMount'),
  ...require('./getVolumeMounts'),
  ...require('./getVirtualIP'),
}