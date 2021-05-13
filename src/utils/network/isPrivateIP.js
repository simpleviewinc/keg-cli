const privateIpv4Classes = {
  A: [ '10.0.0.0', '10.255.255.255' ],
  B: [ '172.16.0.0', '172.31.255.255' ],
  C: [ '192.168.0.0', '192.168.255.255' ],
}

/**
 * 
 * @param {String} ip 
 * @returns {Boolean} - true if the ip is 
 */
 const isPrivateIP = ip => {
  return Object
    .values(privateIpv4Classes)
    .some(range => ipMatch(ip, range))
}