const { ipIsInRange } = require('../')

describe('ipIsInRange', () => {

  it('should check if an ip falls within a range', () => {
    expect(ipIsInRange(
      '192.168.1.0',
      '192.168.0.0',
      '192.168.255.255',
    )).toEqual(true)

    expect(ipIsInRange(
      '192.167.0.0',
      '192.168.0.0',
      '192.168.255.255',
    )).toEqual(false)
  })

  it('should work with exact match on edges', () => {
    expect(ipIsInRange(
      '192.168.0.0',
      '192.168.0.0',
      '192.168.255.255',
    )).toEqual(true)

    expect(ipIsInRange(
      '192.168.255.255',
      '192.168.0.0',
      '192.168.255.255',
    )).toEqual(true)
  })

  it('should reject malformed or null ip addresses', () => {
    const oldLogger = console.error
    console.error = jest.fn()

    expect(ipIsInRange(
      '',
      '',
      '',
    )).toEqual(false)

    expect(ipIsInRange()).toEqual(false)

    expect(ipIsInRange(
      '192.168',
      '192.168',
      '192.168',
    )).toEqual(false)

    console.error = oldLogger
  })

})