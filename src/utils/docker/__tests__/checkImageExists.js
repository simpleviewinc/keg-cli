const { DOCKER } = require('KegConst/docker')
const { docker, dockerData } = require('KegMocks/libs/docker')
const { testEnum } = require('KegMocks/jest/testEnum')
const { injectedTest, injectedContainer } = require('KegMocks/injected/injectedTest')

jest.setMock('KegDocCli', docker)

const generalErrorMock = jest.fn(() => {})
jest.setMock('../../error/generalError', { generalError: generalErrorMock })

const globalConfig = global.getGlobalCliConfig()
jest.setMock('../../globalConfig/globalConfigCache', {
  __getGlobalConfig: jest.fn(() => globalConfig)
})
const withInjected = { ...DOCKER.CONTAINERS, INJECTED: injectedContainer }
jest.setMock('KegConst/docker', { DOCKER: { ...DOCKER, CONTAINERS: withInjected }})

const { checkImageExists } = require('../checkImageExists')

const testArgs = {
  contextExist: {
    description: 'It should return true when only the context is passed',
    inputs: { context: 'core' },
    outputs: dockerData.images.core
  },
  imageExist: {
    description: 'It should return true when the image param is passed',
    inputs: { image: 'keg-core' },
    outputs: dockerData.images.core
  },
  imageIdExist: {
    description: 'It should return true when only an image id is passed',
    inputs: { image: 'a2aba7cf204f' },
    outputs: dockerData.images.tap
  },
  doesNotExist: {
    description: 'It should return false for non-existing images',
    inputs: { context: 'test-context', image: 'test-image' },
    outputs: false
  },
}

describe('checkImageExists', () => {

  afterAll(() => jest.resetAllMocks())

  it(`should throw when no image or context is passed`, async done => {
    let error
    try { await checkImageExists({}) }
    catch(err){ error = err }
    
    setTimeout(() => {
      expect(error).not.toBe(undefined)
      expect(generalErrorMock).toHaveBeenCalled()
      done()
    }, 100)

  })

  testEnum(testArgs, checkImageExists)

})