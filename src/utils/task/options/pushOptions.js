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
    tag: {
      alias: [ 'tg' ],
      description: 'Tag for the image create for the package. Defaults to the current branch of the passed in context',
      example: `keg ${task} ${action} tag=my-tag`,
    },
    tags: {
      description: 'Extra tags to add to the docker image after its built. Uses commas (,) to separate',
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
    action: {
      description: 'Runs an action defined in the Values files before packaging the container. Use --no-action to bypass',
      example: `keg ${task} ${action} --action build.web`,
      default: 'tap.build'
    },
    from: fromImage(task, action),
    ...dockerOptions(task, action),
  }
}

module.exports = {
  pushOptions
}