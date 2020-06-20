const { Sync } = require('./sync')
const { Config } = require('./config')
const { mutagenCli } = require('./commands')
const { GLOBAL_CONFIG_FOLDER, CLI_ROOT } = require('KegConst/constants')

const defOptions = {
  configFolder: GLOBAL_CONFIG_FOLDER,
  cliRoot: CLI_ROOT,
}

class Mutagen {

  constructor(options={}){
    this.options = deepMerge(defOptions, options)
    this.sync = new Sync(this)
    this.config = new Config(this)
  }

  start = () => {
    return mutagenCli({ opts: 'daemon start' })
  }

  stop = () => {
    return mutagenCli({ opts: 'daemon stop' })
  }

}

const mutagen = new Mutagen({})

module.exports = {
  Mutagen,
  mutagen
}