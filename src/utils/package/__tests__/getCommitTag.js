const { testEnum } = require('KegMocks/jest/testEnum')

const locs = { test: 'test/location', anotherTest: 'another/test/location' }
const gitMock = { branch: { current: jest.fn(({ location }) => ({ name: locs[location] })) }}

jest.setMock('KegGitCli', { git: gitMock })

const testArgs = {
  commitTagOverride: {
    description: 'It should use the passed in commit tag when it exists',
    inputs: ['', 'custom-commit-tag'],
    outputs: 'custom-commit-tag'
  },
  branchFromLocation: {
    description: 'It should get the current branch from the passed location',
    inputs: ['test'],
    outputs: locs.test
  },
  branchFromAnotherLocation: {
    description: 'It should allow different locations to be passed',
    inputs: ['anotherTest'],
    outputs: locs.anotherTest
  },
}

const { getCommitTag } = require('../getCommitTag')

describe('getCommitTag', () => {
  afterAll(() => jest.resetAllMocks())
  testEnum(testArgs, getCommitTag)
})