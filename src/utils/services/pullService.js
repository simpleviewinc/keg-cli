const docker = require('KegDocCli')
const { Logger } = require('KegLog')
const { exists, get, isObj, deepMerge } = require('@keg-hub/jsutils')
const { runInternalTask } = require('../task/runInternalTask')
const { getImgNameContext } = require('../getters/getImgNameContext')
const { shouldPullImage } = require('../helpers/shouldPullImage')
const { spawnProc } = require('KegProc')

/**
 * Checks if the base image should be pulled
 * @function
 * @param {Object} serviceArgs - Parsed option arguments passed to the current task
 * @param {boolean} serviceArgs.pull - Should the image should be pulled (skipped is property undefined)
 * @param {Object} serviceArgs.force - Override default setting 
 * @param {boolean} internalForce - Internal Keg-CLI argument to force pulling the image
 * @param {boolean} paramForce - Force pull from params
 *
 * @returns {boolean} - Should the keg-base image be pulled
 */
const checkPullImage = async ({ force, pull, ...params }, internalForce) => {
  return exists(pull)
    ? pull
    : exists(force)
      ? force
      : exists(internalForce)
        ? internalForce
        : await shouldPullImage(params)
}

/**
 * Checks the if a new base image should be pulled, and pulls it if needed
 * @param {Object} serviceArgs - Parsed option arguments passed to the current task
 *
 * @returns {Object} - docker pull task response. (Sets `isNewImage` property if a new image was pulled)
 */
const pullService = async (serviceArgs, pullService='docker') => {

  // Check if the image should be pulled
  const shouldPull = await checkPullImage(
    serviceArgs.params,
    get(serviceArgs, '__internal.forcePull'),
  )

  const imgNameContext = await getImgNameContext(serviceArgs.params)

  if(!shouldPull) return { imgNameContext, isNewImage: false }

  const pullArgs = deepMerge(serviceArgs, { __internal: { imgNameContext }})

  try {
    // Check and pull the image if needed
    return pullService !== 'docker'
      ? await runInternalTask('docker.tasks.compose.tasks.pull', pullArgs)
      : await runInternalTask('docker.tasks.provider.tasks.pull', pullArgs)
  }
  catch(err){
    // TODO: Check the error type
    // If the error is due to something other then a time out we want to throw
    err.message && Logger.warn(err.message)
    return { imgNameContext, isNewImage: false }
  }

}

module.exports = {
  pullService
}