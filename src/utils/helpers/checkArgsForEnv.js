const { ENV_MAP, ENV_ALIAS, ENV_OPTIONS } = require('../../constants/constants')

/**
 * Checks if the passed in args have an env argument
 * If they do, then pull the value from the args
 * @function
 *
 * @returns {string|boolean} - env value or false
*/
const checkArgsForEnv = () => {
  const [cmd, ...args] = process.argv.slice(2)

  const foundEnv = args.reduce((found, arg, idx) => {
    if(found) return found

    const [ key, value ] = arg.includes('=')
      ? arg.split('=')
      : [arg.replace(/-/g, ''), args[idx + 1]]

    return ENV_ALIAS.includes(key) && ENV_OPTIONS.includes(value) && value
  }, false)
  
  // Get the full env name from the env map, incase a shortcut is used
  return foundEnv && Object.entries(ENV_MAP)
      .reduce((fullEnv, [ key, shortcuts ]) => (
        fullEnv || (shortcuts.includes(foundEnv) ? key.toLowerCase() : fullEnv)
      ), false)

}

module.exports = {
  checkArgsForEnv
}