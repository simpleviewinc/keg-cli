// Because the constants uses the os lib, we need to import them first before mocking it
// That way we can load them and use the os lib without any errors
// Then mock the os lib and the constants with the previously loaded constants
const constants = require('../../constants/constants')
jest.mock('os')
jest.setMock('../../constants/constants', constants)

const { getAddresses }  = require('../')
const { privateIPMock, publicIPMock } = require('../__mocks__/getAddresses')
const os = require('os')


describe('getAddresses', () => {
  it('should get the address(es) matching the parameters', () => {

    os.networkInterfaces.mockReturnValueOnce({
      en0: [ privateIPMock, publicIPMock ]
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
      privateIPMock
    )
  })

  it('should do no filtering if no parameters are passed', () => {

    os.networkInterfaces.mockReturnValueOnce({
      en0: [ privateIPMock, publicIPMock ]
    })

    const addresses = getAddresses({})

    expect(addresses.length).toEqual(2)

    expect(
      addresses
    ).toEqual(
      expect.arrayContaining([ privateIPMock, publicIPMock ])
    )
  })
})