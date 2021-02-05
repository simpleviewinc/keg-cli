const { fromImage, pullImage, tagVariable } = require('./singleOptions')
const { dockerOptions } = require('./dockerOptions')
const { contextOptions } = require('./contextOptions')

const buildOptions = (task, action, options) => {
  return {
    ...contextOptions(task, action, options),
    ...dockerOptions(task, action, [ 'provider', 'namespace' ]),
    tags: {
      alias: [ 'tag' ],
      description: 'Extra tags to add to the docker image when its build. Uses commas (,) to separate',
      example: `keg ${task} ${action} tags=my-tag,local,develop`,
      type: 'array'
    },
    version: {
      alias: [ 'ver' ],
      description: 'Version to tag the image with. Typically use to match a git repo release version',
      example: `keg ${task} ${action} --version 1.0.0`,
    },
    tagVariable: tagVariable(task, action),
    tagGit: {
      alias: [ 'taggit', 'tgit', 'tagG', 'tagg', 'git', 'tg' ],
      allowed: [ 'branch', 'br', 'commit', 'cm', false ],
      description: 'Tag the image with the current git branch or commit hash of the repo',
      example: `keg ${task} ${action} --git commit`,
      default: false
    },
    tagPackage: {
      alias: [
        'tagpackage',
        'tpackage',
        'tPackage',
        'Package',
        'package',
        'tPack',
        'tpack',
        'pack',
        'tPkg',
        'tpkg',
        'pkg',
        'tpg',
        'pg',
        'tp'
      ],
      description: 'Tag the image with the current version in the repos package.json file',
      example: `keg ${task} ${action} --package`,
      default: false
    },
    squash: {
      alias: [ 'sq' ],
      description: 'Squash the docker image layers into its parent image. Requires docker experimental to be turned on',
      example: `keg ${task} ${action} --squash`,
      default: false,
    },
    from: fromImage(task, action),
    push: {
      alias: ['psh', 'ps'],
      description: 'Auto push the newly built image to a provider',
      example: `keg ${task} ${action} --no-push`,
      default: false, 
    },
    cache: {
      description: 'Skip using docker build cache when building the image',
      example: `keg ${task} ${action} --no-cache`,
      default: true
    },
    local: {
      description: 'Copy the local repo into the docker container at build time. Dockerfile must support KEG_COPY_LOCAL env. Overrides globalConfig setting!',
      example: `keg ${task} ${action} --local`,
      default: false,
    },
    latest: {
      description: 'Adds the latest tag to the docker image.',
      example: 'keg ${task} ${action} --no-latest',
      default: true
    },
    log: {
      description: 'Log docker command before they are run',
      example: 'keg ${task} ${action} --log true',
      default: false
    },
    buildArgs: {
      alias: [ 'args', 'bargs', 'bArgs', 'bA', 'ba', 'buildA' ],
      description: `Extra build args as key / value pairs to pass on to the docker build command.`,
      example: `keg ${task} ${action} --buildArgs custom:arg,other:arg`,
      type: 'array',
    }
  }
}

module.exports = {
  buildOptions
}