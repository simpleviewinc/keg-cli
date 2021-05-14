
jest.mock('os')

const { getAddresses } = require('../')
const os = require('os')

const privateAddress = {
  address: '192.168.1.2',
  internal: true,
  family: 'IPv4'
}

const publicAddress = {
  address: '171.255.255.255',
  internal: false,
  family: 'IPv4'
}

describe('getAddresses', () => {
  it('should get the address(es) matching the parameters', () => {

    os.networkInterfaces.mockReturnValueOnce({
      en0: [ privateAddress, publicAddress ]
    })

    const addresses = getAddresses({
      private: true,
      public: false,
      version: 4
    })

    expect(addresses.length).toEqual(1)

    expect(
      addresses[0]
    ).toEqual(
      privateAddress
    )
  })

  it('should do no filtering if no parameters are passed', () => {

    os.networkInterfaces.mockReturnValueOnce({
      en0: [privateAddress, publicAddress ]
    })

    const addresses = getAddresses({})

    expect(addresses.length).toEqual(2)

    expect(
      addresses
    ).toEqual(
      expect.arrayContaining([ privateAddress, publicAddress ])
    )
  })
})