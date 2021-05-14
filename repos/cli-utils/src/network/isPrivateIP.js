const { ipIsInRange } = require('./ipIsInRange')

const privateIpv4Classes = {
  A: [ '10.0.0.0', '10.255.255.255' ],
  B: [ '172.16.0.0', '172.31.255.255' ],
  C: [ '192.168.0.0', '192.168.255.255' ],
}

/**
 * @param {String} ip - ipv4 string 
 * @returns {Boolean} - true if the ip is private and ipv4
 */
 const isPrivateIP = ip => {
  return Object
    .values(privateIpv4Classes)
    .some(range => ipIsInRange(ip, range[0], range[1]))
}

module.exports = { isPrivateIP }