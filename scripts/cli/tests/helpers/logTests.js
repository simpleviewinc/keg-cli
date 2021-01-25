const { Logger }  = require('KegLog')

const logFailed = ({ parent, cmd,  data }) => {

}

const logSuccess = ({ parent, cmd,  data }) => {

}

const logTests = (tests) => {

  Logger.empty()
  Logger.empty()

  tests.responses.map(test => {
    if(test.exitCode === 0)
      return Logger.success(`Passed:`, Logger.colors.brightWhite(`${test.cmd}`))

    Logger.empty()
    Logger.fail(`Failed:`, Logger.colors.brightWhite(`${test.cmd}`))
    Logger.pair(`  Exit Code:`, `${test.exitCode}`)
    Logger.pair(`  Response:`, `${test.response}`)
    Logger.empty()
  })

  Logger.empty()
}


module.exports = {
  logFailed,
  logSuccess,
  logTests
}