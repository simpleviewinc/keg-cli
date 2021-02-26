module.exports = {
  ...require('./checkPathExists'),
  ...require('./confirmExec'),
  ...require('./findDependencyName'),
  ...require('./findPathByName'),
  ...require('./hasHelpArg'),
  ...require('./optionsHasArg'),
  ...require('./parseJson'),
  ...require('./runYarnScript'),
  ...require('./updateLocationContext'),
}