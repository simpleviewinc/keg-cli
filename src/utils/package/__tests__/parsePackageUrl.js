
const { Logger } = require('KegMocks/logger')
jest.setMock('KegLog', { Logger })

const toParse = 'ghcr.io/test-user/test-repo/test-img:1591977796609'
const { parsePackageUrl } = require('../parsePackageUrl')

describe('parsePackageUrl', () => {

  afterAll(() => jest.resetAllMocks())

  it('should parse the passed in package url', () => {

    const { account, image, provider, repo, tag } = parsePackageUrl(toParse)

    expect(account).toBe('test-user')
    expect(image).toBe('test-img')
    expect(provider).toBe('ghcr.io')
    expect(repo).toBe('test-repo')
    expect(tag).toBe('1591977796609')

  })

})