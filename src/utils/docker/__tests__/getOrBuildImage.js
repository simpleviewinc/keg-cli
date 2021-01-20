const { get } = require('@keg-hub/jsutils')
const { testEnum } = require('KegMocks/jest/testEnum')

const runInternalTaskMock = jest.fn((taskPath, args) => {
  return args.__testTaskPath
    ? taskPath
    : args.__testArgPath
      ? get(args, args.__testArgPath)
      : args
})

jest.setMock('KegUtils/task/runInternalTask', { runInternalTask: runInternalTaskMock })

const { getOrBuildImage } = require('../getOrBuildImage')

const testArgs = {
  buildTask: {
    description: 'It should call runInternalTask for docker build when build params is true',
    inputs: { params: { build: true }, __testTaskPath: true },
    outputs: 'tasks.docker.tasks.build'
  },
  getTask: {
    description: 'It should call runInternalTask for docker image get when build params is false',
    inputs: { params: { build: false }, __testTaskPath: true },
    outputs: 'tasks.docker.tasks.image.tasks.get'
  },
  dupParams: {
    description: 'It should pass a copy of the args.params to runInternalTask',
    matchers: [ 'not.toBe', 'toEqual' ],
    inputs: { params: { copied: true }, __testArgPath: 'params' },
    outputs: { copied: true }
  },
}

describe('getOrBuildImage', () => {

  afterAll(() => jest.resetAllMocks())

  testEnum(testArgs, getOrBuildImage)

})