const { isStrBool, toBool } = require('@keg-hub/jsutils')

const NEWLINE = '\n'
const NEWLINES_ESC = /\\n/g

/**
 * Parses the value, by removing quotes and checking for string booleans
 * @function
 * @param {string} value - Value to be parsed
 *
 * @returns {string|Array|boolean} - Parse .env file content
 */
const convertValue = value => {
  // Get the last char of the value
  const end = value.length - 1
  const isDoubleQuoted = value[0] === '"' && value[end] === '"'
  const isSingleQuoted = value[0] === "'" && value[end] === "'"

  // Check if it has quotes, and if so remove them out of the value
  const cleaned = (isSingleQuoted || isDoubleQuoted)
    ? value.substring(1, end).trim().replace(NEWLINES_ESC, NEWLINE)
    : value.trim()

  // Check if it's a string boolean and convert or just return the value
  return isStrBool(cleaned) ? toBool(cleaned): cleaned
}

/**
 * Parse an env file string into an object
 * @function
 * @param {string} content - String to be converted
*/
const parse = content => {
  return content.toString().split('\n')
    .reduce((result, line) => {
      const match = line.match(/^([^=:#]+?)[=:](.*)/)
      if(!match) return result

      const key = match[1].trim()
      const value = match[2].trim()
      result[key] = convertValue(value)

      return result
    })
}

/** 
 * Turn an object into an env file string
 * @function
 * @param {Object} obj - Object to convert
 * 
 * @returns {string} - Converted object
*/
const stringify = obj => {
  return Object.entries(obj)
    .reduce((result, [key, value]) => {
      return key ? `${result}${key}=${String(value)}\n` : result
    }, '')
}

module.exports ={
  parse,
  stringify
}

