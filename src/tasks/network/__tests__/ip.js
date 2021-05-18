jest.mock('KegRepos/cli-utils')

const { publicMock: public, privateMock: private } = require('KegRepos/cli-utils')
const { ip } = require('../ip')

describe('ip', () => {

  const _oldLog = console.log
  beforeAll(() => {
    console.log = jest.fn()
  })
  afterAll(() => {
    console.log = _oldLog
  })

  it('should print out the public and private ips when passed no params', async () => {
    await ip.action({
      params: {}
    })

    expect(console.log).toHaveBeenLastCalledWith({
      public,
      private,
    })
  })

  it('should print the public ip', async () => {
    await ip.action({ params: { public: true } })
    expect(console.log).toHaveBeenLastCalledWith(public)
  })

  it('should print the private ip', async () => {
    await ip.action({ params: { private: true } })
    expect(console.log).toHaveBeenLastCalledWith(private)
  })

  it('should get the ip for a url', async () => {
    await ip.action({ params: { url: 'archive.org' } })
    expect(console.log).toHaveBeenLastCalledWith(public)
  })

})