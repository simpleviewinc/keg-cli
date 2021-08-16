const os = require('os')
const { mapFind } = require('@keg-hub/jsutils')

/**
 * Gets the best matching IP address of the host machine,
 * ignoring IPv6, internal, loopback, and a dns-resolver
 * @function
 *
 * @returns {string} - Found host IP address
 */
const getHostIP = () => {
  const ifaces = os.networkInterfaces()

  // pass over each interface to find the host address
  return mapFind(
    ifaces, 
    iface => mapFind(iface, addrInfo => {
      const { family, internal, address } = addrInfo

      // we may have the custom dns resolver running (see scripts/docker/dnsmasq)
      // and in that case, we want to ignore addresses that start with this ip
      const isDNSResolverMatch = address.indexOf('169.254') === 0

      return (family !== 'IPv4' || internal || address === '127.0.0.1' || isDNSResolverMatch)
          ? undefined
          : address 
    })
  )
}

module.exports = {
  getHostIP
}