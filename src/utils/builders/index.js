
module.exports = {
  ...require('./buildContainerContext'),
  ...require('./buildContextEnvs'),
  ...require('./buildGlobalTaskAlias'),
  ...require('./buildDocContextCmd'),
  ...require('./buildDockerLogin'),
  ...require('./buildTapContext'),
  ...require('./buildTaskData'),
}