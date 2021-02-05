const { Logger }  = require('KegLog')

const logFailedHeader = () => {
  Logger.header(`Failed Tests`, 'brightRed')
}

const logFailed = ({ parent, cmd, response, exitCode }, expected, result) => {
  Logger.empty()
  Logger.fail(`  Test Failed:`, Logger.colors.brightWhite(`keg ${cmd}`))
  exitCode && Logger.pair(`    Exit Code:`, `${exitCode}`)
  response && Logger.pair(`    Response:`, `${response}`)
  Logger.empty()
}

const logSuccess = ({ parent, cmd, response }) => {
  Logger.subHeader(`Test Passed: keg ${Logger.colors.brightWhite(cmd)}`, 'brightGreen')
  Logger.empty()
  Logger.empty()
}

const logTests = (tests) => {
  Logger.empty()

  let failedHeader = false

  tests.responses.map(test => {
    if(test.exitCode === 0) return

    !failedHeader && logFailedHeader()
    failedHeader = true
    logFailed(test)
  })

  Logger.empty()

}


module.exports = {
  logFailed,
  logSuccess,
  logTests
}