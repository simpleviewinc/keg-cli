
module.exports = {
  ...require('./getGitKey'),
  ...require('./getGitPath'),
  ...require('./getPublicGitKey'),
  ...require('./getRemoteUrl'),
  ...require('./gitKeyExists'),
}