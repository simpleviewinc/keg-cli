jest.mock('../getAddresses')

const { getPrivateIPs } = require('../getPrivateIPs')
const { privateIPMock } = require('../__mocks__/getAddresses')

describe('getPrivateIP', () => {
  it('Should get the private IP', () => {
    const [ ip ] = getPrivateIPs()
    expect(ip).toEqual(privateIPMock.address)
  })
})