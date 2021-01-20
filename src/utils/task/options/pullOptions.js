const { fromImage, tagVariable } = require('./singleOptions')
const { dockerOptions } = require('./dockerOptions')
const { contextOptions } = require('./contextOptions')

const pullOptions = (task, action) => {
  return {
    ...contextOptions(task, action),
    ...dockerOptions(task, action),
    from: fromImage(task, action),
    branch: {
      description: 'Name of branch name to use as the tag',
      example: 'keg ${ task } pull --branch develop',
    },
    tagVariable: tagVariable(task, action),
    version: {
      description: 'The version of the image to pull',
      example: 'keg ${ task } pull --version 0.0.1',
    },
    force: {
      description: 'Force pull the image, overriding the globalConfig settings.',
      example: `keg ${ task } pull --force`,
    },
  }
}

module.exports = {
  pullOptions
}