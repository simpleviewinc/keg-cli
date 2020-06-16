
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

const listProcesses = async args => {
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
  'list': {
    name: 'list',
    alias: [ 'ls', 'l', ],
    action: listProcesses,
    description: `Utility for listing processes using a specified port`,
    example: 'keg net list --port 5901',
    options: {
      port: {
        alias: ['p'],
        description: 'The port to search by',
        example: 'keg net list --port 5901',
        required: true,
      },
    }
  }
}