const { getPrivateIPs, getPublicIP, getPublicIPsForUrl } = require('KegRepos/cli-utils')
const { generalError } = require('KegUtils/error')

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
    const ips = await getPublicIPsForUrl(url)
    return ips.map(ip => console.log(ip))
  }

  if (!public && !private) return console.log({
    public: await getPublicIP(),
    private: (await getPrivateIPs())[0]
  })

  public && console.log(await getPublicIP())
  private && console.log((await getPrivateIPs())[0])
}

module.exports = {
  ip: {
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