const docker = require('KegDocCli')
const { Logger } = require('KegLog')
const { get, isStr, noOpObj } = require('@keg-hub/jsutils')
const { generalError } = require('KegUtils/error/generalError')
const { getImgNameContext } = require('KegUtils/getters/getImgNameContext')
const { checkPulledNewImage } = require('KegUtils/docker/checkPulledNewImage')
const { mergeTaskOptions } = require('KegUtils/task/options/mergeTaskOptions')

/**
 * Pulls an image locally from a configured registry provider in the cloud
 * @param {Object} args - arguments passed from the runTask method
 * @param {string} args.command - Initial command being run
 * @param {Array} args.options - arguments passed from the command line
 * @param {Object} args.tasks - All registered tasks of the CLI
 * @param {Object} args.task - Current task being run
 * @param {Object} args.params - Formatted key / value pair of the passed in options
 * @param {Object} globalConfig - Global config object for the keg-cli
 *
 * @returns {Object} - Current state of the image to be pulled
 */
const providerPull = async args => {
  const { globalConfig, __internal=noOpObj, params, task } = args

  // Get the image name context, so we can pull the image
  const imgNameContext = __internal.imgNameContext || await getImgNameContext(params)

  // Try to pull the image
  const { data, error, exitCode } = await docker.pull({ url: imgNameContext.full, pipe: true })

  // // Get the docker image object that was just pulled
  const imageRef = await docker.image.get(imgNameContext.full)
  const isNewImage = checkPulledNewImage(data, error)

  // Return the state of the image being pulled
  return { imgNameContext, isNewImage, imageRef }

}


module.exports = {
  pull: {
    name: 'pull',
    alias: [ 'pl' ],
    action: providerPull,
    description: 'Pulls an image from a Docker registry provider',
    example: 'keg docker provider pull <options>',
    options: mergeTaskOptions(`docker provider`, `pull`, `pull`),
  }
}