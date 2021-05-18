const dns = require('dns')

/**
 * @param {String} url 
 * @returns {Promise} a promise that resolves to the ip address mapped to the url
 */
const getPublicIPsForUrl = url => {
  return new Promise((res, rej) => {
    dns.resolve4(url, (err, addresses) => {
      err
        ? rej(err)
        : res(addresses)
    })
  })
}

module.exports = { getPublicIPsForUrl }