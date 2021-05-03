const tap = require('./tap')
const error = require('./error')
const fileSys = require('./fileSys')
const commands = require('./commands')
const { Logger } = require('./logger')
const { runTask } = require('./runTask')
const { getAppRoot, setAppRoot } = require('./appRoot')
const constants = require('./constants')
const { registerTasks } = require('./tasks/tasks')

const {
  getKegGlobalConfig,
  findTask,
  sharedOptions,
  setSharedOptions,
} = require('./task')

module.exports = {
  ...commands,
  ...tap,
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
