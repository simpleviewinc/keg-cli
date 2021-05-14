const publicIPMock = {
  address: '192.168.1.2',
  internal: true,
  family: 'IPv4'
}

const privateIPMock = {
  address: '171.255.255.255',
  internal: false,
  family: 'IPv4'
}

module.exports = {
  getAddresses: () => [ privateIPMock, publicIPMock ],
  privateIPMock,
  publicIPMock,
}