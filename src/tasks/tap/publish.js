const { get } = require('@keg-hub/jsutils')
const { publishService } = require('KegUtils/services/publishService')
const { logPublishSummary } = require('KegUtils/publish/logPublishSummary')
const { setupPublishOptions } = require('KegUtils/publish/setupPublishOptions')
const { mapPublishTaskOptions } = require('KegUtils/publish/mapPublishTaskOptions')
const { updateLocationContext } = require('KegUtils/helpers/updateLocationContext')

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
const publishTap = async (args) => {
  const { params: { tap, branch, tag, version }} = args
  const updatedArgs = updateLocationContext(args, {
    params: {
      context: 'tap',
      tap: get(args, 'params.tap') || 'tap',
    }
  })

  const result = await publishService(updatedArgs, {
    ...mapPublishTaskOptions(updatedArgs),
    tap: true,
    name: tap,
    dependent: false,
    order: {},
  })
  logPublishSummary(result)

  return true

}
module.exports = {
  publish: {
    name: 'publish',
    alias: [ 'pub' ],
    action: publishTap,
    inject: true,
    description: `Publish a tap to git and NPM`,
    example: 'keg tap publish <options>',
    options: {
      tap: {
        description: 'Linked tap name to use as the publish context!',
        example: 'keg tap publish --tap <my-tap>',
      },
      dryrun: {
        alias: ['dry-run', 'dr'],
        description: 'Does everything publish would do except pushing to git and publishing to npm',
        example: 'keg tap publish --dry-run',
        default: false
      },
      confirm: {
        description: 'Asks the user to confirm the updates before publishing. Set to false for CI/CD environments',
        example: 'keg tap publish --no-confirm',
        default: true
      },
      version: {
        alias: [ 'ver' ],
        description: 'New version to be published. Must be valid semver or one of major, minor or patch',
        example: 'keg tap publish --version 1.0.0',
      },
      ...setupPublishOptions()
    }
  }
}