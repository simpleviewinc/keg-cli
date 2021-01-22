const { spawn } = require('child_process')
const docker = require('KegDocCli')
const { getServiceArgs } = require('./getServiceArgs')
const { exists, get, isObj } = require('@keg-hub/jsutils')
const { runInternalTask } = require('../task/runInternalTask')
const { getImgNameContext } = require('../getters/getImgNameContext')
const { shouldPullImage } = require('../helpers/shouldPullImage')
const { spawnProc } = require('KegProc')

/**
 * Checks if the base image should be pulled
 * @function
 * @param {Object} serviceArgs - Parsed option arguments passed to the current task
 * @param {Object} serviceArgs.force - Override default setting 
 * @param {boolean} internalForce - Internal Keg-CLI argument to force pulling the image
 * @param {boolean} paramForce - Force pull from params
 *
 * @returns {boolean} - Should the keg-base image be pulled
 */
const checkPullImage = async ({ force, ...params }, internalForce) => {
  return exists(force)
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
const pullService = async serviceArgs => {

  // Check if the image should be pulled
  const shouldPull = checkPullImage(
    serviceArgs.params,
    get(serviceArgs, '__internal.forcePull'),
  )

  const imgNameContext = await getImgNameContext(serviceArgs.params)

  if(!shouldPull) return { imgNameContext, isNewImage: false }

  // Check and pull the image if needed
  return await runInternalTask('docker.tasks.provider.tasks.pull', { 
    ...serviceArgs,
    __internal: {
      ...serviceArgs.__internal,
      forcePull: shouldPull,
      imgNameContext,
    }
  })

}

module.exports = {
  pullService
}