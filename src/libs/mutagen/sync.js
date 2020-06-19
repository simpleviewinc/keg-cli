const { mutagenCli } = require('./commands')
const { deepMerge, get, reduceObj, snakeCase, styleCase } = require('jsutils')

/**

  mutagen sync create --name=keg --default-file-mode="0644" --default-directory-mode="0755" --sync-mode="one-way-safe" --ignore="/*" --ignore="\\!/core/" --ignore="\\!/index.js" --ignore="\\!/tap.json" --ignore="\\!/app.json" --ignore="\\!/App.js" --ignore="\\!/babelconfig.js" --ignore="\\!/metro.config.js" --ignore="\\!/package.json" --ignore="\\!/webpack.config.js" /Users/lancetipton/keg/keg-core docker://c4aea5b80d16/keg/keg-core

  mutagen sync create --name=keg --default-file-mode=0644 --default-directory-mode=0755 --sync-mode=one-way-safe --ignore=/node_modules --ignore=/.* --ignore=/core/base/assets/* /Users/lancetipton/keg/keg-core docker://c4aea5b80d16/keg/keg-core

  Works :)
  mutagen sync create --name=keg --default-file-mode=0644 --default-directory-mode=0755 --sync-mode=one-way-safe --ignore=/node_modules --ignore=/.* --ignore=/core/base/assets/* /Users/lancetipton/keg/keg-core docker://c4aea5b80d16/keg/keg-core
  ${ CONTEXT_PATH } docker://${ containerId }/${ DOC_APP_PATH }

*/

/**
 * Default sync argument options
 * @object
 */
const syncDefs = {
  create: {
    defaultFileMode: 0644,
    defaultDirectoryMode: 0755,
    syncMode: `one-way-safe`
  }
}

/**
 * Builds the ignore arguments for the create command 
 * @function
 * @param {Array} ignore - Array of paths to ignore
 *
 * @returns {string} - Joined ignore arguments as a string
 */
const buildIgnore = (ignore=[]) => {
  return ignore.reduce((ignored, ignore) => {
    return !ignore
      ? ignored
      : ignored
        ? `${ ignored } --ignore=${ ignore }`.trim()
        : `--ignore=${ ignore }`.trim()
  }, false)
}

/**
 * Builds the argument for the create command 
 * @function
 * @param {Array} ignore - Array of paths to ignore
 * @param {Object} create - Key/Values Arguments object for the create command
 *
 * @returns {string} - Joined create arguments as a string
 */
const buildCreateArgs = ({ ignore, create }) => {
  let createArgs = `${ buildIgnore(ignore) }`.trim()

  return reduceObj(create, (key, value, createdArgs) => {
    return value
      ? `${ createdArgs } --${ styleCase(snakeCase(key)) }=${ value }`
      : createdArgs
  }, createArgs)
}

/**
 * Builds the mount path for the sync between the local host and docker container
 * @function
 * @param {string} from - Location on the local host to be synced
 * @param {string} to - Location on the docker container to be synced
 * @param {string} container - The id of the container to sync with
 *
 * @returns {string} - Joined create arguments as a string
 */
const buildMountPath = ({ from, to, container }) => {
  const toPath = container ? `docker://${ container }/${ to }` : to
  return `${ from } ${ toPath }`
}

class Sync {

  constructor(options){
    this.options = deepMerge(syncDefs, options)
  }

  /**
  * Creates a sync between the local machine an a docker container
  * <br/> First builds the args, then the full create string, then calls the mutagen CLI 
  * @function
  * @param {Object} args - Location on the local host to be synced
  *
  * @returns {*} - response from the mutagen CLI
  */
  create = async (args) => {
    const { ignore, from, container, to } = args
    const argsStr = buildCreateArgs({
      ignore,
      create: get(this, 'options.create', {}),
    })
    const mountPath = buildMountPath(args)

    return mutagenCli({
      opts: `sync create ${ argsStr } %{ mountPath }`,
    })

  }

}

module.exports = {
  Sync
}