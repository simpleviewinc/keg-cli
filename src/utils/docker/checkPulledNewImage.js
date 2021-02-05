const { isStr, noOpObj } = require('@keg-hub/jsutils')

/**
 * Checks the stdout and stderr output to see if an image already exists
 * @function
 * @param {string} data - All stdout output of the compose pull command
 * @param {string} error - All stderr output of the compose pull command
 *
 * @returns {boolean} - True if the image already exists
 */
const checkPulledNewImage = (data, error) => {
  const notInData = isStr(data) && !data.toLowerCase().includes('image is up to date')
  const notInError = isStr(error) && !error.toLowerCase().includes('image is up to date')

  return Boolean(notInData && notInError)
}

module.exports = {
  checkPulledNewImage
}