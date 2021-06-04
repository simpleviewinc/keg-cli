const tap = require('./tap')
const path = require('./path')
const error = require('./error')
const network = require('./network')
const fileSys = require('./fileSys')
const commands = require('./commands')
const { Logger } = require('./logger')
const constants = require('./constants')
const { runTask } = require('./runTask')
const { registerTasks } = require('./tasks/tasks')
const { getAppRoot, setAppRoot } = require('./appRoot')

const {
  getKegGlobalConfig,
  findTask,
  sharedOptions,
  setSharedOptions,
} = require('./task')

module.exports = {
  ...commands,
  ...network,
  ...tap,
  ...path,
  constants,
  getKegGlobalConfig,
  findTask,
  fileSys,
  error,
  Logger,
  registerTasks,
  runTask,
  sharedOptions,
  setSharedOptions,
  getAppRoot,
  setAppRoot,
}
