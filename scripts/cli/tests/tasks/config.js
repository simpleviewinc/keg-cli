const { uuid } = require('@keg-hub/jsutils')

const testUuid = uuid()

const set = {
  tasks: [
    `config set --no-confirm --key __AUTO_TEST_ENV_KEG --value ${testUuid}`,
  ]
}

const unset = {
  tasks: [
    `config unset --no-confirm --key __AUTO_TEST_ENV_KEG`,
  ]
}

const print = {
  tasks: [
    'config print',
  ]
}

const sync = {
  tasks: [
    'config sync --no-confirm',
  ]
}

const taskOpts = {}

// Keg-CLI config tasks to test
const configTasks = {
  beforeTasks: async () => {
    // TODO: add code to back current cli.config.json && default.envs
    // We don't want to mess up the users config files
  },
  runTasks: async (testArray) => {
    await testArray(set, taskOpts)
    await testArray(print, taskOpts)
    await testArray(unset, taskOpts)
    await testArray(sync, taskOpts)
  }
}

module.exports = {
  config: configTasks,
}