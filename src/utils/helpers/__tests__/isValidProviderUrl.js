const { get } = require('@keg-hub/jsutils')
const { testEnum } = require('KegMocks/jest/testEnum')


const { isValidProviderUrl } = require('../isValidProviderUrl')

const testArgs = {
  dockerReg: {
    description: 'It should return true when url contains the default docker registry',
    inputs: `docker.io/`,
    outputs: true
  },
  validUrl: {
    description: 'It should return true when url is valid',
    inputs: `test.docker.provider/provider/namespace/my-image:test-tag`,
    outputs: true
  },
  noSlash: {
    description: 'It should return false when url does not have a slash',
    inputs: `test.docker.provider-my-image:test-tag`,
    outputs: false
  },
  noColon: {
    description: 'It should return false when url does not have a colon',
    inputs: `test.docker.provider/provider/my-image/test-tag`,
    outputs: false
  },
  noTag: {
    description: 'It should return false when url does not have a tag',
    inputs: `test.docker.provider/provider/my-image:`,
    outputs: false
  },
  noUndefined: {
    description: 'It should return false when url does has undefined with in it',
    inputs: `test.docker.provider/undefined/my-image:test-tag`,
    outputs: false
  },
}

describe('isValidProviderUrl', () => {

  afterAll(() => jest.resetAllMocks())

  testEnum(testArgs, isValidProviderUrl)

})