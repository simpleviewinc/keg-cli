jest.mock('dns')

const { getPublicIPsForUrl } = require('../getPublicIPsForUrl')

const dns = require('dns')

describe('getIPForUrl', () => {
  const ip = '74.226.115.13'
  beforeAll(() => {
    dns
      .resolve4
      .mockImplementation(
        (_, callback) => callback(null, [ ip ])
      )
  })

  it('should return the ip addr for a specified url', async () => {
    const ips = await getPublicIPsForUrl('foo.com')
    expect(ips.length).toEqual(1)
    expect(ips[0]).toEqual(ip)
  })
})