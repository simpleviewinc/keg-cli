const privateMock = '192.168.1.41'
const publicMock = '71.226.115.13'

module.exports = {
  privateMock,
  publicMock,
  getPrivateIPs: () => [ privateMock ],
  getPublicIP: () => publicMock,
  getPublicIPsForUrl: () => [publicMock]
}