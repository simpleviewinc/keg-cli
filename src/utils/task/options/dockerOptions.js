const { pickKeys, isArr } = require('@keg-hub/jsutils')

const dockerOptions = (task, action, options) => {
  const docOpts = {
    provider: {
      alias: [ 'pro' ],
      description: 'Use custom provider (registry url) instead of the default defined in the globalConfig',
      example: 'keg ${ task } ${action} --provider ghcr.io',
    },
    namespace: {
      alias: [ 'account' ],
      description: 'Use custom namespace (organization) instead of default defined in the globalConfig',
      example: 'keg ${ task } ${action} --namespace simpleviewinc',
    },
    tag: {
      description: 'Specify the tag tied to the image',
      example: 'keg ${ task } ${action} --tag my-tag-name'
    },
  }

  return isArr(options) ? pickKeys(docOpts, options) : docOpts
}


module.exports =  {
  dockerOptions
}