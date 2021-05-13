const { networkInterfaces } = require('os')
const { get } = require('@keg-hub/jsutils')
const { generalError } = require('KegUtils/error')
const dns = require('dns');
const axios = require('axios')

const privateIpv4Classes = {
  A: [ '10.0.0.0', '10.255.255.255' ],
  B: [ '172.16.0.0', '172.31.255.255' ],
  C: [ '192.168.0.0', '192.168.255.255' ],
}

/**
 * @param {string} ip 
 * @param {Array} range - arr with a start and end ip string, defining a range
 * @returns {Boolean} - true if the ip falls within the ip range
 */
const ipMatch = (ip, range) => {
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

/**
 * @param {Object} options 
 * @param {string | number} options.version - ip version
 * @returns 
 */
const getPrivateIP = (options={}) => {
  const version = checkVersion(options.version) || 4
  const interfaces = networkInterfaces()
  const addresses = getAddresses({
    interfaces,
    interface: 'en0',
    private: true,
    version
  })
  return addresses.length
    ? addresses[0].address
    : null
}

/**
 * @param {string} versionStr 
 * @return {number} the number associated with ip version
 */
const checkVersion = (versionStr='') => {
  ['ipv4', 'ip4', '4'].includes(versionStr.toString().toLowerCase())
    ? 4
    : ['ipv6', 'ip6', '6'].includes(versionStr.toString().toLowerCase())
      ? 6
      : null
}

/**
 * @returns {string} public ip address of current machine
 */
const getPublicIP = async () => {
  const url = `https://api.ipify.org?format=json`
  try {
    const result = await axios.get(url)
    return result.data.ip
  }
  catch (err) {
    console.error(err)
  }
}

/**
 * 
 * @param {String} url 
 * @returns 
 */
const getIpFor = url => {
  return new Promise((res, rej) => {
    dns.resolve4(url, (err, addresses) => {
      err
        ? rej(err)
        : res(addresses)
    })
  })
}


/**
 * Prints out public or private ip information for either
 * the current machine or the specified url
 * @param {Object} args.params 
 * @param {Boolean} args.params.private
 * @param {Boolean} args.params.public
 * @param {String} args.params.url
 * @returns {Void}
 */
const getIp = async args => {
  const { params } = args
  const { public, private, url } = params

  if (url) {
    private && generalError('Cannot query a url for a private ip') 
    const ips = await getIpFor(url)
    return ips.map(ip => console.log(ip))
  }

  if (!public && !private) return console.log({
    public: await getPublicIP(),
    private: await getPrivateIP()
  })

  public && console.log(await getPublicIP())
  private && console.log(await getPrivateIP())
}

module.exports = {
  'ip': {
    name: 'ip',
    action: getIp,
    description: `Utility for determining your ip address(es)`,
    example: 'keg net ip --public',
    options: {
      url: {
        description: 'If set, will find the ip address mapped to the URL'
      },
      public: {
        alias: ['pub'],
        description: 'If true, only show your public ip address',
      },
      private: {
        alias: ['prv'],
        description: 'If true, only show your private ip address',
      },
    }
  }
}