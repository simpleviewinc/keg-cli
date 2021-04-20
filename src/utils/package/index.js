
module.exports = {
  ...require('./buildAppBundle'),
  ...require('./buildPackageURL'),
  ...require('./formatPackage'),
  ...require('./getAuthor'),
  ...require('./getCommitTag'),
  ...require('./imageFromContainer'),
  ...require('./parsePackageUrl'),
}