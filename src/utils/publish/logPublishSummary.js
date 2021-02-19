const { Logger } = require('KegLog')
const { get } = require('@keg-hub/jsutils')


/**
 * Logs the summary for the publish task
 * @param {Array} repos - updated repos
 */
const logPublishSummary = (repos) => {
  if (!repos) return null
  Logger.empty()
  Logger.header(`Publish Summary`)
  Logger.table(repos.map((repo) => {
    return {
      name: repo.repo, 
      newVersion: get(repo, 'newVersion'),
      published: get(repo, 'isPublished')
    }
  }))
  Logger.empty()
}

module.exports = {
  logPublishSummary
}