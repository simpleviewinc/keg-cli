
module.exports = {
  ...require('./buildPackageURL'),
  ...require('./formatPackage'),
  ...require('./getAuthor'),
  ...require('./getCommitTag'),
  ...require('./imageFromContainer'),
  ...require('./parsePackageUrl'),
  ...require('./runBuildAction')
}