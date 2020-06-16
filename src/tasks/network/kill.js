const { throwRequired } = require('KegUtils')
const { Logger } = require('KegLog')
const { executeCmd } = require('KegProc')
const { ask } = require('KegQuestions')
const { pickKeys } = require('jsutils')
/**
 * Parses the lsof string to return an object representing a process using a port
 * @param {string} lsofString - string from the lsof command
 * @returns {object} - process
 */
const parseProcess = (lsofString='') => {
  if (!lsofString) return null 

  const split = lsofString.split(/\s+/)

  const [
    command,
    pid,
    owner,
    fileDescriptor, 
    ipProtocol,
    _,
    __,
    connectionProtocol, 
    portStr,
  ] = split


  const portSplit = portStr.split(':')
  const port = portSplit[1] || portSplit[0]

  return {
    port,
    command,
    pid,
    owner,
    fileDescriptor,
    fd: fileDescriptor,
    protocol: {
      ip: ipProtocol,
      connection: connectionProtocol
    }
  }
}

const getProcessesUsingPort = async port => {
  const { error, data, exitCode } = await executeCmd(
    `lsof -nP -iTCP:${port} | grep LISTEN`,
    {}
  )

  if (error || exitCode) return []

  return data
    .split('\n')
    .map(parseProcess)
    .filter(p => p)
}

const killProcess = async pid => {
  if (!pid || pid <= 0) 
    throw new Error('pid must be positive')
  
  const { error } = await executeCmd(
    `kill -9 ${pid}`,
    {} 
  )

  if (error) throw new Error(error)
  else console.log('Process killed.')
}

const confirmKill = async (port, processes=[]) => {
  Logger.info('Processes using port:')
  console.table(
    processes.map(p => pickKeys(p, ['pid', 'port', 'command', 'owner', 'protocol']))
  )
  return await ask.input(`Kill ${processes.length} processes using port ${port}? [y/n]`)
}

/**
 * Utility for finding and terminating processes using a specified port
 * @param {Object} args - arguments passed from the runTask method
 * @param {string} args.command - Initial command being run
 * @param {Array} args.options - arguments passed from the command line
 * @param {Object} args.tasks - All registered tasks of the CLI
 * @param {Object} globalConfig - Global config object for the keg-cli
 *
 * @returns {void}
 */
const killPortUser = async args => {
  const { task, params } = args
  const { port, force } = params

  const processes = await getProcessesUsingPort(port)

  if (process.length === 0) 
    return Logger.info(`No processes are using port ${port}`)

  const userResponse = !force && await confirmKill(port, processes)

  if (!userResponse || ['n', 'no'].includes(userResponse.toLowerCase())) return

  processes.map(proc => killProcess(proc.pid))
}

module.exports = {
  'kill': {
    name: 'kill',
    alias: [ 'k' ],
    action: killPortUser,
    description: `Utility for finding and terminating processes using a specified port`,
    example: 'keg net kill 5901',
    options: {
      port: {
        alias: ['p'],
        description: 'The port the process is using',
        example: 'keg net kill --port 5901',
        required: true
      },
      force: {
        alias: [ 'y', 'f' ],
        description: 'Bypass the confirmation prompt before killing any processes',
        example: 'keg net kill --port 5901 --force',
      }
    }
  }
}