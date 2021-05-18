const { isPrivateIP } = require('../')

describe('isPrivateIP', () => {
  it('should check if ip is private', () => {
    expect(
      isPrivateIP('192.167.1.1')
    ).toEqual(false)

    expect(
      isPrivateIP('192.168.1.1')
    ).toEqual(true)
  })

  it('should reject IPv6', () => {
    expect(
      isPrivateIP('fe80::1081:1e6c:f84b:3e78')
    ).toEqual(false)
  })
})