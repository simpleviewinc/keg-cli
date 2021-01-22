const docker = require('KegDocCli')
const { eitherArr, get } = require('@keg-hub/jsutils')

/**
 * Gets the inspect context for a passed in image reference
 * @param {string} image - Reference to a docker image
 *
 * @returns {Object} - Inspect context for the passed in image ref
 */
const getImgInspectContext = async (image, imgInspect) => {
  // Get the inspect object of the image
  const toInspect = imgInspect || await docker.image.inspect({ image })
  if(!toInspect) return {}
  
  // Get the image labels and Envs that were built with the image
  const imgLabels = get(toInspect, 'config.Labels', {})

  // Get the command to run the image when its a container 
  const imgCmd = get(toInspect, 'config.Cmd', [])

  // Convert the image ENV's from an array to an object so it can be merged with the contextEnvs
  const imgEnvs = get(toInspect, 'config.Env', [])
    .reduce((envObj, env) => {
      const [ key, value ] = env.split('=')
      key && value && (envObj[key] = value)

      return envObj
    }, {})

  // Get the short ID to match what docker normally returns
  const imgId = toInspect.id.split(':')[1].substring(0, 12)

  return {
    id: imgId,
    envs: imgEnvs,
    labels: imgLabels,
    fullId: toInspect.id,
    inspectRef: toInspect,
    cmd: eitherArr(imgCmd, [imgCmd]).join(' ')
  }
}

module.exports = {
  getImgInspectContext
}