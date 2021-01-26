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

  // Get the image ports and convert it to an array of port values
  // Right now we don't care about protocol we just use tcp
  // But we may need it in the future, to leaving this comment here
  // Port looks like this -> ExposedPorts: { '60710/tcp': {} }
  // So get the keys of ExposedPorts, and split on the / to get the number
  const imgPorts = Object.keys(get(imgInspect, 'config.ExposedPorts', {}))
    .map(key => key.split('/').shift())

  // Get the short ID to match what docker normally returns
  const imgId = imgInspect.id.split(':')[1].substring(0, 12)

  return {
    id: imgId,
    envs: imgEnvs,
    labels: imgLabels,
    ports: imgPorts,
    fullId: imgInspect.id,
    inspectRef: imgInspect,
    cmd: eitherArr(imgCmd, [imgCmd]).join(' ')
  }
}

module.exports = {
  getImgInspectContext
}