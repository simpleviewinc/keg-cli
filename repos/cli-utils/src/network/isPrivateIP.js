const { ipIsInRange } = require('./ipIsInRange')
const { PRIVATE_IPV4_CLASSES } = require('../constants/constants')



/**
 * @param {String} ip - ipv4 string 
 * @returns {Boolean} - true if the ip is private and ipv4
 */
 const isPrivateIP = ip => {
  return Object
    .values(PRIVATE_IPV4_CLASSES)
    .some(range => ipIsInRange(ip, range[0], range[1]))
}

module.exports = { isPrivateIP }