const semver = require('semver')
const { Logger } = require('KegLog')
const { getHubRepos } = require('KegUtils/hub/getHubRepos')
const { get, mapObj, isEmptyColl } = require('@keg-hub/jsutils')
const { getTapPackage, getTapPath } = require('KegRepos/cli-utils')
const { updateVersionInDependencies } = require('KegUtils/version/updateVersionInDependencies')

const depKeys = [
  'devDependencies',
  'dependencies',
  'peerDependencies'
]

/**
 * Prints out the found mismatches dependencies of the keg-hub repos
 * @param {Object} versionsDiff - Dependencies, repos and versions
 *
 * @returns {void}
 */
const displayMismatches = versionsDiff => {
  if(isEmptyColl(versionsDiff))
    return Logger.info(`\nNo mismatched dependency versions found!\n`)

  Logger.header(`Mismatched Dependencies`)

  mapObj(versionsDiff, (depName, versions) => {
    Logger.pair(`  Dependency:`, depName)

    Logger.pair(`    Current:`, versions.current)
    Logger.pair(`    Repo:`, versions.repo)

    Logger.empty()
  })
}

/**
 * Cleans the version number so it can be compared
 * @param {string} version - Version number of a dependency from a package.json file
 *
 * @returns {string} - Cleaned Version number
 */
const cleanVersion = ver => semver.clean(ver.replace('^', ''))

/**
 * Gets meta-data about the taps @keg-hub versions
 * @param {Object} tapPackage - The taps package.json file
 * @param {Object} packages - @keg-hub repos package.json files
 *
 * @returns {Object} versionDiff - Meta data about @keg-hub repo versions
 */
const getVersionDiffs = (tapPackage, packages) => {
  const versionsDiff = {}
  mapObj(packages, (repo, package) => {
    const { name:repoName, version:repoVersion } = package

    depKeys.map(depKey => {
      const curVersion = get(tapPackage, [depKey, repoName])
      if(!curVersion) return

      semver.neq(
        semver.coerce(cleanVersion(curVersion)),
        semver.coerce(cleanVersion(repoVersion))
      ) && (versionsDiff[repoName] = { current: curVersion, repo: repoVersion } )
    
    })
  })

  return versionsDiff
}

/**
 * Updates the version of @keg-hub repos in a taps package.json
 * @param {Object} versionDiff - Meta data about @keg-hub repo versions
 * @param {string} tapName - Name of the tap to update
 * @param {Object} tapPackage - The taps package.json file
 * @param {Object} globalConfig - Global config object for the keg-cli
 *
 * @returns {void}
 */
const updateVersions = (versionDiff, tapName, tapPackage, globalConfig) => {
  const tapPath = getTapPath(globalConfig, tapName)

  mapObj(versionDiff, (repoName, { repo:version }) => {
    updateVersionInDependencies(
      repoName,
      [{ location: tapPath, package: tapPackage }],
      version
    )
  })

  Logger.empty()
  Logger.success(`Tap ${tapName} package.json @keg-hub dependencies have been updated!`)
  Logger.info(`No git commands have been run. You must do that manually!`)
  Logger.empty()

}

/**
 * Gets the current version of the keg-hub repos
 * Compares them with the current taps dependencies
 * Displays or updates the dependencies where needed
 * @param {Object} args - arguments passed from the runTask method
 * @param {string} args.command - Initial command being run
 * @param {Array} args.options - arguments passed from the command line
 * @param {Object} args.tasks - All registered tasks of the CLI
 * @param {Object} globalConfig - Global config object for the keg-cli
 *
 * @returns {void}
 */
const tapDepsTask = async args => {
  const { globalConfig } = args
  const { tap, display, dependencies, update, ...params } = args.params

  const packages = {}
  const [ tapPackage ] = getTapPackage({ name: tap })
  await getHubRepos({
    ...params,
    context: dependencies || 'all',
    callback: (repo, package) => (packages[repo] = package)
  })

  const versionDiff = getVersionDiffs(tapPackage, packages)

  display && displayMismatches(versionDiff)
  update && updateVersions(versionDiff, tap, tapPackage, globalConfig)

  return true
}

module.exports = {
  dependencies: {
    name: 'dependencies',
    alias: [ 'deps', 'dep', 'dp' ],
    inject: true,
    action: tapDepsTask,
    description: `Manage a taps @keg-hub dependencies`,
    example: 'keg tap dependencies <options>',
    options: {
      tap: { 
        description: 'Name of the tap to run. Must be a tap linked in the global config',
        example: 'keg tap dependencies --tap <tap-name>',
        required: true,
      },
      dependencies: {
        alias: [ 'deps', 'dep'],
        description: 'File the dependencies that will be checked',
        example: 'keg tap dependencies --dependencies expo,rollup',
        type: 'array',
        default: [],
      },
      display: {
        alias: [ 'dis' ],
        description: 'Display dependency mismatches across keg-hub repos',
        example: 'keg tap dependencies --no-display',
        default: true
      },
      update: {
        alias: [ 'up' ],
        description: 'Updates a specific dependency in the taps package.json',
        example: 'keg tap dependencies --update',
        default: false,
      }
    }
  }
}