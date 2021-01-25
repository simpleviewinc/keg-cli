const docker = require('KegDocCli')
const { eitherArr, get } = require('@keg-hub/jsutils')

/**
 * Gets the inspect context for a passed in image reference
 * @param {string} image - Reference to a docker image
 *
 * @returns {Object} - Inspect context for the passed in image ref
 */
const getImgInspectContext = async ({ image }) => {
  // Get the inspect object of the image
  const imgInspect = await docker.image.inspect({ image })

  if(!imgInspect) return {}
  
  // Get the image labels and Envs that were built with the image
  const imgLabels = get(imgInspect, 'config.Labels', {})

  // Get the command to run the image when its a container 
  const imgCmd = get(imgInspect, 'config.Cmd', [])

  // Convert the image ENV's from an array to an object so it can be merged with the contextEnvs
  const imgEnvs = get(imgInspect, 'config.Env', [])
    .reduce((envObj, env) => {
      const [ key, value ] = env.split('=')
      key && value && (envObj[key] = value)

      return envObj
    }, {})

  // Get the short ID to match what docker normally returns
  const imgId = imgInspect.id.split(':')[1].substring(0, 12)

  return {
    id: imgId,
    envs: imgEnvs,
    labels: imgLabels,
    fullId: imgInspect.id,
    inspectRef: imgInspect,
    cmd: eitherArr(imgCmd, [imgCmd]).join(' ')
  }
}

module.exports = {
  getImgInspectContext
}