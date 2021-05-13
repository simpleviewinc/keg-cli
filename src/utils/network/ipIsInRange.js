/**
 * @param {string} ip 
 * @param {Array} range - arr with two elements: a start and end ip string, defining a range
 * @returns {Boolean} - true if the ip falls within the ip range
 * @example
 * ipIsInRange('192.168.1.0', ['192.168.0.0', '192.168.255.255'])
 * -> true
 */
 const ipIsInRange = (ip, range) => {
  const [ start, end ] = range
  const parts = ip.split('.').map(parseInt)
  const startParts = start.split('.').map(parseInt)
  const endParts = end.split('.').map(parseInt)

  if (parts.length !== 4) return false

  for (let i = 0; i < 4; i++) {
    if (parts[i] < startParts[i] || parts[i] > endParts[i])
      return false
  }

  return true
}