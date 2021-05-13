const tap = require('./tap')
const error = require('./error')
const fileSys = require('./fileSys')
const utils = require('./utils')
const commands = require('./commands')
const { Logger } = require('./logger')
const constants = require('./constants')
const { runTask } = require('./runTask')
const { registerTasks } = require('./tasks/tasks')
const { getAppRoot, setAppRoot } = require('./appRoot')
const network = require('./network')

const {
  getKegGlobalConfig,
  findTask,
  sharedOptions,
  setSharedOptions,
} = require('./task')

module.exports = {
  ...utils,
  ...commands,
  ...network,
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
