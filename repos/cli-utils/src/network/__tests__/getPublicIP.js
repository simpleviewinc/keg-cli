
jest.mock('axios')

const { getPublicIP } = require('../getPublicIP')
const axios = require('axios')

describe('getPublicIP', () => {

  const ip = '71.226.115.13'
  beforeAll(() => {
    axios.get.mockReturnValue(Promise.resolve({ data: { ip }}))
  })

  it('should obtain the public ip from the api', async () => {
    expect(await getPublicIP()).toEqual(ip)
  })
})