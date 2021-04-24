
module.exports = {
  ...require('./formatPackage'),
  ...require('./getAuthor'),
  ...require('./getCommitTag'),
  ...require('./imageFromContainer'),
  ...require('./parsePackageUrl'),
  ...require('./runBuildAction')
}