const { addParam, addFlag, addValues } = require('../arguments')

describe('addParam', () => {
  it('should return a key value pair', () => {
    expect(
      addParam('foo', 2)
    ).toEqual('--foo 2')

    expect(
      addParam('foo', 0)
    ).toEqual('--foo 0')

  })

  it ('should return empty string for no value', () => {
    expect(
      addParam('foo', undefined)
    ).toEqual('')
  })
})


describe('addFlag', () => {
  it('should return a flag string for non-existent or truthy values', () => {
    expect(
      addFlag('foo', true)
    ).toEqual('--foo')

    expect(
      addFlag('foo', 'bar')
    ).toEqual('--foo')

    expect(
      addFlag('foo')
    ).toEqual('--foo')

  })

  it('should return empty string for falsy values', () => {

    expect(
      addFlag('foo', false)
    ).toEqual('')

    expect(
      addFlag('foo', undefined)
    ).toEqual('')

    expect(
      addFlag('foo', null)
    ).toEqual('')

    expect(
      addFlag('foo', 0)
    ).toEqual('')

  })
})

describe('addValues', () => {
  it('should work with arrays', () => {
    expect(
      addValues(['foo','bar'])
    ).toEqual('foo bar')
  })

  it ('should work for string input', () => {
    expect(
      addValues('foo,bar,baz')
    ).toEqual('foo bar baz')
  })

  it('should return empty string for everything else', () => {
    expect(
      addValues(22)
    ).toEqual('')
  })
})