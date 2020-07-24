
const copyBddRun = () => {
  const { copyFile } = require('KegFileSys/fileSys')
  const { getRepoPath } = require('KegUtils/getters/getRepoPath')
  const { DOCKER: { CONTAINERS_PATH } } = require('KegConst/docker')

  const regulatorPath = getRepoPath('regulator')
  return copyFile(
    `${ CONTAINERS_PATH }/regulator/run.sh`,
    `${ regulatorPath }/run.sh`
  )
}

module.exports = {
  copyBddRun
}