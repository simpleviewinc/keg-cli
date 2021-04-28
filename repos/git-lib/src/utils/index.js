module.exports = {
  ...require('./buildGitSSH'),
  ...require('./configItem'),
  ...require('./configUrl'),
  ...require('./remoteUrl'),
  ...require('./printBranches'),
}