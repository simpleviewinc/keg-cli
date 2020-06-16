const { executeCmd } = require('KegProc')

/**
 * Attempts to kill the process identified by pid
 * @param {string} pid - process id
 */
const kill = async pid => {
  if (!pid || pid <= 0) 
    throw new Error('pid must be positive')
  
  const { error } = await executeCmd(
    `kill -9 ${pid}`,
    {} 
  )

  if (error) throw new Error(error)
  else console.log('Process killed.')
}

module.exports = { kill }