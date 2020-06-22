const { mutagenCli } = require('./commands')
const { deepMerge, get } = require('jsutils')
const { buildIgnore, buildMountPath, buildMutagenArgs } = require('./helpers')

/**

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
    syncMode: `one-way-safe`,
    ignoreVcs: true
  }
}

class Sync {

  constructor(mutagen){
    this.mutagen = mutagen
    this.options = deepMerge(syncDefs, this.mutagen.options)
  }

  /**
  * Creates a sync between the local machine an a docker container
  * <br/> First builds the args, then the full create string, then calls the mutagen CLI 
  * @function
  * @param {Object} args - Location on the local host to be synced
  * @param {Object} args.ignore - All paths that the sync should ignore
  * @param {string} from - Location on the local host to be synced
  * @param {string} to - Location on the docker container to be synced
  * @param {string} container - The id of the container to sync with
  *
  * @returns {*} - response from the mutagen CLI
  */
  create = async (args) => {
    const { ignore, from, container, to } = args
    const argsStr = buildMutagenArgs({
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