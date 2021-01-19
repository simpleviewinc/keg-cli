const { spawn } = require('child_process')
const docker = require('KegDocCli')
const { buildService } = require('./buildService')
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

  const imageNameContext = await getImgNameContext(serviceArgs.params)

  if(!shouldPull) return { imgNameContext: imageNameContext, isNewImage: false }

  // Check and pull the image if needed
  const imgPullResp = await runInternalTask('docker.tasks.provider.tasks.pull', { 
    ...serviceArgs,
    __internal: {
      ...serviceArgs.__internal,
      forcePull: shouldPull,
      imgNameContext: imageNameContext,
    }
  })

  const { imgNameContext, imageRef } = imgPullResp

  // If no new image, or no name context, just return the response
  // if(!imgPullResp.isNewImage) return imgPullResp

  // Add the local tag so it seems like it's been built on the host machine
  await docker.image.tag({
    item: imgNameContext.full,
    tag: imgNameContext.imageWTag,
    provider: true
  })

  // // TODO: figure out some way to add the tag back to the image
  // // Before checking is it should be pulled again
  // // If we remove the tag, then the next time it checks for the image
  // // It will think it does not exist, and try to pull it
  // // Remove the remote tag
  // await docker.image.removeTag({
  //   image: imageRef,
  //   tag: imgNameContext.tag,
  // })
  // 62b1f59c3cbc
  // Add the URL label and re-tag the image through a rebuild
  // Which will allow us to know where the image came from
  // const rebuildCmd = ['echo']
  // rebuildCmd.push(`"FROM ${imgNameContext.full}"`)
  // rebuildCmd.push(`| docker build`)
  // rebuildCmd.push(`--label keg.image.repository="${imgNameContext.full}"`)
  // rebuildCmd.push(`-t "${imgNameContext.imageWTag}" -`)




  // await spawnProc(`bash`, { args: [ '-c', rebuildCmd.join(` `) ] })
  // await spawn('bash', ['-c', rebuildCmd.join(` `) ], {
  //   gid: process.getgid(),
  //   uid: process.getuid(),
  //   env: process.env,
  //   cwd: process.cwd(),
  //   stdio: 'inherit'
  // })

  // return imgPullResp

}

module.exports = {
  pullService
}