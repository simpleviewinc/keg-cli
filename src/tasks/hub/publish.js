const { get, exists } = require('@keg-hub/jsutils')
const { publishService } = require('KegUtils/services/publishService')
const { logPublishSummary } = require('KegUtils/publish/logPublishSummary')
const { setupPublishOptions } = require('KegUtils/publish/setupPublishOptions')
const { mapPublishTaskOptions } = require('KegUtils/publish/mapPublishTaskOptions')

/**
 * Push Keg Hub repos to NPM and Github
 * @param {Object} args - arguments passed from the runTask method
 * @param {string} args.command - Initial command being run
 * @param {Array} args.params - arguments passed from the command line
 * @param {Object} args.tasks - All registered tasks of the CLI
 * @param {Object} globalConfig - Global config object for the keg-cli
 *
 * @returns {void}
 */
const hubPublish = async args => {
  const result = await publishService(args, mapPublishTaskOptions(args))

  logPublishSummary(result)

  return true
}

module.exports = {
  publish: {
    name: 'publish',
    alias: [ 'pub' ],
    description: 'Push Keg Hub repos to NPM and Github',
    action: hubPublish,
    example: 'keg hub publish <options>',
    options: {
      context: {
        alias: [ 'ctx' ],
        description: 'Publish context to use from the globalConfig!',
        example: 'keg hub publish --context keg',
        default: 'keg'
      },
      dryrun: {
        alias: [ 'dry-run', 'dry', 'dr'],
        description: 'Does everything publish would do except pushing to git and publishing to npm',
        example: 'keg hub publish --dry-run',
        default: false
      },
      confirm: {
        description: 'Asks the user to confirm the updates before publishing. Set to false for CI/CD environments',
        example: 'keg hub publish --no-confirm',
        default: true
      },
      version: {
        alias: [ 'ver' ],
        description: 'New version to be published. Must be valid semver or one of major, minor or patch',
        example: 'keg hub publish --version 1.0.0',
      },
      ...setupPublishOptions()
    }
  }
}