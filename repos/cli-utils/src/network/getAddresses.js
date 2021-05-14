const { networkInterfaces } = require('os')
const { isPrivateIP } = require('./isPrivateIP')

/**
 * @param {String} familyStr  (e.g. IPv6)
 * @returns {Number} 4 or 6, depending on the family string
 */
const getIPVersion = familyStr => familyStr && parseInt(
  familyStr.charAt(familyStr.length - 1)
)

/**
 * Gets network addresses matching the filter parameters
 * @param {Object} options
 * @param {Boolean} options.private - if true, only get private ip addresses
 * @param {Boolean} options.public - if true, only get public ip addresses
 * @param {Object} options.interface - the interface to get addresses for
 * @param {Object} options.internal - whether or the ip address is internal or not
 * @param {number | string} options.version - the ip version
 * @returns {Array} - array of matching addresses
 */
 const getAddresses = ({ interface='en0', private, public, version }) => {
  const interfaces = networkInterfaces()

  if (!interfaces[interface])
    throw new Error(`Could not find interface ${interface} in network`)

  return interfaces[interface].filter(addr => {
    const ipVersion = getIPVersion(addr.family)
    const isPrivate = isPrivateIP(addr.address)

    return (!version || ipVersion === version)
      && (!private || isPrivate)
      && (!public || !isPrivate)
  })
}

module.exports = { getAddresses }