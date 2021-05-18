const { validate } = require('@keg-hub/jsutils')
const { isIP } = require('net')

const parseParts = ip => ip.split('.').map(part => parseInt(part))

/**
 * @param {string} ip - ipv4 string
 * @param {string} start - start of ip range
 * @param {string} end - end of ip range
 * @returns {Boolean} - true if the ip falls within the ip range
 * @example
 * ipIsInRange('192.168.1.0', '192.168.0.0', '192.168.255.255')
 * -> true
 */
 const ipIsInRange = (ip, start, end) => {
  const [ valid ] = validate({ ip, start, end }, { $default: isIP })
  if (!valid) return false

  const parts = parseParts(ip)
  const startParts = parseParts(start)
  const endParts = parseParts(end)

  // reject IPv6 addresses
  if (parts.length !== 4)
    return false

  for (let i = 0; i < 4; i++) {
    if (parts[i] < startParts[i] || parts[i] > endParts[i])
      return false
  }

  return true
}

module.exports = { ipIsInRange }