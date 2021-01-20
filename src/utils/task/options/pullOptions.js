const { fromImage, tagVariable } = require('./singleOptions')

const pullOptions = (task, action) => {
  return {
    context: {
      description: 'Context of the docker container to pull',
      example: 'keg ${ task } pull --context <value>',
      enforced: true,
    },
    tap: {
      description: 'Name of the tap to pull. Only needed if "context" argument is "tap"',
      example: 'keg ${ task } pull --tap <name-of-linked-tap>',
    },
    provider: {
      description: 'Override the url of the docker provider',
      example: 'keg ${ task } pull --provider docker.pkg.github.com',
      default: 'docker.pkg.github.com'
    },
    namespace: {
      description: 'Use custom namespace (organization) instead of default defined in the globalConfig for docker provider url',
      example: 'keg ${ task } pull --namespace my-organization',
    },
    from: fromImage(task, action),
    branch: {
      description: 'Name of branch name to use as the tag',
      example: 'keg ${ task } pull --branch develop',
    },
    tag: {
      description: 'Specify the tag tied to the image being pushed',
      example: 'keg ${ task } pull --tag my-tag-name'
    },
    tagVariable: tagVariable(task, action),
    version: {
      description: 'The version of the image to pull',
      example: 'keg ${ task } pull --version 0.0.1',
    },
    force: {
      description: 'Force pull the image, overriding the globalConfig settings.',
      example: `keg ${ task } pull --force`,
    }
  }
}

module.exports = {
  pullOptions
}