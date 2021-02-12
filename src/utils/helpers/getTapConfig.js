const path = require('path')
const { Logger } = require('KegLog')
const { generalError } = require('../error/generalError')
const { getRepoPath } = require('../getters/getRepoPath')

const jsonConfig = () => {
  try {
    const rawdata = readFileSync(path.resolve(repoPath, 'tap.json'))
    return JSON.parse(rawdata)
  }
  catch(error){
    pathError && Logger.warn(`Missing package.json file in keg-hub/repos folder "${repo}"!`)
    pathError && Logger.info(`Repo "${repo}" will not be included in task execution!`)
    return false
  }
}


const loadTapConfig = 

const getTapConfig = (tap, tapPath) => {
  tapPath = tapPath || getRepoPath(tap)
  !tapPath && generalError(`Path to tap ${tap} could not be found!`)

}


module.exports = {
  getTapConfig
}