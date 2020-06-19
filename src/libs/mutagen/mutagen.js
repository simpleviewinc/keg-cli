const { Sync } = require('./sync')
const { mutagenCli } = require('./commands')

class Mutagen {

  constructor(options={}){
    this.sync = new Sync(options)
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