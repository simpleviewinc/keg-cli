const path = require('path')
const { spawnCmd, asyncCmd } = require('@keg-hub/spawn-cmd')
const kegCliDir = path.join(__dirname, '../../../../')
const kegExecCmd = path.join(__dirname, `../keg-exec.sh`)


// TODO: 
// 1. Add pipeCmd to capture print statements for validating cmd output
// 2. Pass output to tests, to assert proper output

// Helper to call the keg-cli from a child_process
const kegCmd = cmd => (spawnCmd(`bash`, { args: [ kegExecCmd, ...cmd.split(' ') ] }, kegCliDir))

// Helper to call the keg-cli from a child_process async
const kegCmdAsync = cmd => (asyncCmd(`bash ${kegExecCmd} ${cmd}`, {}, kegCliDir))


module.exports = {
  kegCmd,
  kegCmdAsync
}