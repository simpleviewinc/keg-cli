
module.exports = {
  ...require('./buildContainerContext'),
  ...require('./buildContextEnvs'),
  ...require('./buildGlobalTaskAlias'),
  ...require('./buildDockerLogin'),
  ...require('./buildTapContext'),
  ...require('./buildTaskData'),
}