const { pickKeys, isArr } = require('@keg-hub/jsutils')

const contextOptions = (task, action, options) => {
  const contextOpts = {
    context: {
      alias: [ 'ctx', 'name' ],
      description: `Keg-CLI context for the ${task} ${action} task`,
      example: `keg ${task} ${action} --context core`,
      enforced: true,
    },
    tap: {
      description: 'Name of the tap to set as the context. Required when "context" is "tap"',
      example: `keg ${task} ${action} --context tap --tap <name-of-linked-tap>`,
    },
  }

  return isArr(options) ? pickKeys(contextOpts, options) : contextOpts
}

module.exports = {
  contextOptions
}