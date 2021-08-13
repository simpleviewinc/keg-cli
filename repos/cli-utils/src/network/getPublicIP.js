const axios = require('axios')
const { get } = require('@keg-hub/jsutils')

const IP_API = `https://api.ipify.org?format=json`

/**
 * @returns {string?} public ip address of current machine
 */
const getPublicIP = async () => {
  try {
    const result = await axios.get(IP_API)
    return get(result, 'data.ip')
  }
  catch (err) {
    console.error(err)
    return null
  }
}

module.exports = { getPublicIP }
