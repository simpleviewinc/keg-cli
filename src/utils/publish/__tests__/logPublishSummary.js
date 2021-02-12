jest.resetAllMocks()
const { Logger } = require('KegLog')

const repos = [{
  repo: 'test-repo',
  newVersion: true,
  isPublished: false,
}]

const { logPublishSummary } = require('../logPublishSummary')

describe('logPublishSummary', () => {

  afterAll(() => jest.resetAllMocks())

  it(`Should call console.table when repos are passed in`, () => {
    logPublishSummary(repos)
    expect(Logger.table).toHaveBeenCalled()
  })

  it(`Should return null when no repos are passed in`, () => {
    const resp = logPublishSummary()
    expect(resp).toBe(null)
  })

})