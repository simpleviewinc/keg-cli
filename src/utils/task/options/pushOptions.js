const { fromImage } = require('./singleOptions')
const { dockerOptions } = require('./dockerOptions')
const { contextOptions } = require('./contextOptions')

const pushOptions = (task, action) => {
  return {
    ...contextOptions(task, action),
    build: {
      description: 'Build the docker image before pushing to the provider',
      example: `keg ${task} ${action} --build`,
      default: false
    },
    tags: {
      description: 'Extra tags to add to the docker image after its build. Uses commas (,) to separate',
      type: 'array',
      example: `keg ${task} ${action} tags=my-tag,local,develop`
    },
    token: {
      description: 'API Token for the registry provider',
      example: `keg ${task} ${action} token=<custom-provider-token>`
    },
    user: {
      description: 'User to use when logging into the registry provider',
      example: `keg ${task} ${action} user=<custom-provider-user>`
    },
    log: {
      description: 'Log the output the of commands',
      example: `keg ${task} ${action} --log`,
      default: false,
    },
    from: fromImage(task, action),
    ...dockerOptions(task, action),
  }
}

module.exports = {
  pushOptions
}