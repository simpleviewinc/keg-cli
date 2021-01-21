
/**
 * Checks if the passed in value is a Hex value
 * @function
 * @param {string} value - String to check if is a hex string
 *
 * @returns {boolean} - If value is a hex string
 */
const isHex = toTest => {
  let parsed = parseInt(toTest, 16).toString(16)
  // When parsing, if the first char is a 0, then it gets removed
  // So we have to check the first char, and add it back if needed
  parsed = toTest[0] === '0' ? `0${parsed}` : parsed

  // Now check if it matches the original
  return parsed === toTest
}

/**
 * Checks if the passed in value is a valid short docker id
 * @function
 * @param {string} value - String to check if is a valid short docker id
 *
 * @returns {boolean} - If value is a valid short docker it
 */
const isDockerId = toTest => {
  try {
    return isHex(toTest) && toTest.length === 12
  }
  catch(err){
    return false
  }
} 


module.exports = {
  isDockerId,
  isHex,
}