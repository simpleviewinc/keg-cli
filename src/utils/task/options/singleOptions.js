const { allowedTagOpts } = require('../../getters/getTagVarMap')

const fromImage = (task, action) => ({
  alias: [ 'fr' ],
  description: 'Image to use as the FROM directive when building. Overwrites KEG_IMAGE_FROM env when set. KEG_IMAGE_FROM env must be set as the FROM value in the Dockerfile.',
  example: `keg ${task} ${action} --from <custom-image-url-with-tag>`,
})

const pullImage = (task, action) => ({
  alias: [ 'pl' ],
  description: `Pull the most recent image before building. Gets image name and tag through the 'from' option, or KEG_IMAGE_FROM env!`,
  example: `keg ${task} ${action} --no-pull`,
  default: true
})

const tagVariable = (task, action) => ({
  alias: [ 'tagvariable', 'variable', 'tVar', 'tvar', 'Var', 'var', 'tagV', 'tagv', 'tv' ],
  allowed: allowedTagOpts,
  description: 'Create a tag through variable replacement using one or more parts',
  example: `keg ${task} ${action} --tagVariable branch:version`,
  type: 'array'
})

module.exports = {
  fromImage,
  pullImage,
  tagVariable,
}