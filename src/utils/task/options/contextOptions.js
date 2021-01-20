const contextOptions = (task, action) => {
  return {
    context: {
      alias: [ 'ctx', 'name' ],
      description: 'Context for the task ${action} when run',
      example: 'keg ${task} ${action} --context core',
      enforced: true,
    },
    tap: {
      description: 'Name of the tap to set as the context. Required when "context" is "tap"',
      example: `keg ${task} ${action} --context tap --tap <name-of-linked-tap>`,
    },
  }
}

module.exports = {
  contextOptions
}