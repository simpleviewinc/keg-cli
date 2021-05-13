/**
 * 
 * @param {Object} options
 * @param {Boolean} options.private - if true, only get private ip addresses
 * @param {Boolean} options.public - if true, only get public ip addresses
 * @param {Array} options.interfaces - network interfaces on current machine
 * @param {Object} options.interface - the interface to get addresses for
 * @param {number | string} options.version - the ip version
 * @returns {Array} - array of matching addresses
 */
 const getAddresses = ({interfaces, interface='en0', private, public, version }) => {
  const found = get(interfaces, interface, [])
    .filter(addr => {
      const isPrivate = isPrivateIP(addr.address)

      const familyVersion = parseInt(
        addr.family.charAt(addr.family.length - 1)
      )

      return (!version || familyVersion === version)
        && (!private || isPrivate)
        && (!public || !isPrivate)
    })
  
  if (!found.length)
    throw new Error(`Could not find interface ${interface} in network`)

  return found
}