const { dockerOutput } = require('KegMocks/libs/docker')

const Helpers = require('../helpers')

describe('Docker Helpers', () => {

  afterAll(() => jest.resetAllMocks())

  describe('apiSuccess', () => {

    afterAll(() => jest.resetAllMocks())

    it('It should convert the dockerCLI output into a jsonObject', () => {

      const containers = Helpers.apiSuccess(dockerOutput.container.list, 'json')
      expect(containers.length).toBe(2)
      expect(containers[0].id).toBe('084a9d7ab5c5')

    })

  })

  describe('portAsJSON', () => {

    afterAll(() => jest.resetAllMocks())

    it('It should convert the port string data into a JSON object', () => {

        const portObj = Helpers.portAsJSON(`7890/tcp -> 0.0.0.0:4321\n9876/tcp -> 0.0.0.0:1234`)

        expect(portObj['4321']).toBe(7890)
        expect(portObj['1234']).toBe(9876)

    })

    it('It should handle a single string as the first argument and the port as the second', () => {

        const portObj = Helpers.portAsJSON(`0.0.0.0:4321\n`, '7890/tcp')

        expect(portObj['4321']).toBe(7890)

    })

    it('It should handle converting to JSON object without the protocol included', () => {

        const portObj = Helpers.portAsJSON(`7890 -> 0.0.0.0:4321\n9876 -> 0.0.0.0:1234`)

        expect(portObj['4321']).toBe(7890)
        expect(portObj['1234']).toBe(9876)

        const portObj2 = Helpers.portAsJSON(`0.0.0.0:4321`, '7890')

        expect(portObj2['4321']).toBe(7890)

    })


  })

  describe('isDockerId', () => {

    afterAll(() => jest.resetAllMocks())

    it('It should return true for a valid docker id', () => {
      expect(Helpers.isDockerId('ba9e35cde327')).toBe(true)
      expect(Helpers.isDockerId('eb9e92ea6354')).toBe(true)
      expect(Helpers.isDockerId('3ad8d5edbf6c')).toBe(true)
      expect(Helpers.isDockerId('1caa46fa11ba')).toBe(true)
      expect(Helpers.isDockerId('56aa46fa11ba')).toBe(true)
      expect(Helpers.isDockerId('a2aba7cf204f')).toBe(true)
      expect(Helpers.isDockerId('b80dcb1cac10')).toBe(true)
      expect(Helpers.isDockerId('3b74af475ff2')).toBe(true)
      expect(Helpers.isDockerId('a56406239194')).toBe(true)
    })

    it('It should return false for an  invalid docker id', () => {
      expect(Helpers.isDockerId('')).toBe(false)
      expect(Helpers.isDockerId(123)).toBe(false)
      expect(Helpers.isDockerId(123456789123)).toBe(false)
      expect(Helpers.isDockerId('12345678912R')).toBe(false)
      expect(Helpers.isDockerId('aaa')).toBe(false)
      expect(Helpers.isDockerId([])).toBe(false)
      expect(Helpers.isDockerId({})).toBe(false)
      expect(Helpers.isDockerId(true)).toBe(false)
      expect(Helpers.isDockerId('{}')).toBe(false)
    })

  })

})