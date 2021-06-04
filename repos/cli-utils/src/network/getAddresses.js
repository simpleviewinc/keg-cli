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
 * @param {Boolean} options.isPrivate - if true, only get private ip addresses
 * @param {Boolean} options.isPublic - if true, only get public ip addresses
 * @param {Object} options.iface - the interface to get addresses for
 * @param {number | string} options.version - the ip version
 * @returns {Array} - array of matching addresses
 */
 const getAddresses = ({ iface='en0', isPrivate, isPublic, version }) => {
  const interfaces = networkInterfaces()

  if (!interfaces[iface])
    throw new Error(`Could not find interface ${iface} in network`)

  return interfaces[iface].filter(addr => {
    const ipVersion = getIPVersion(addr.family)
    const ipIsPrivate = isPrivateIP(addr.address)

    return (!version || ipVersion === version)
      && (!isPrivate || ipIsPrivate)
      && (!isPublic || !ipIsPrivate)
  })
}

module.exports = { getAddresses }