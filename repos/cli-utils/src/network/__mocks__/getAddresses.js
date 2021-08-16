const publicIPMock = {
  address: '171.255.255.255',
  internal: true,
  family: 'IPv4'
}

const privateIPMock = {
  address: '192.168.1.2',
  internal: false,
  family: 'IPv4'
}

module.exports = {
  getAddresses: ({ isPrivate, isPublic }) => 
    isPrivate 
      ? [ privateIPMock ]
      : isPublic
        ? [ publicIPMock ]
        : [ ],
  privateIPMock,
  publicIPMock,
}