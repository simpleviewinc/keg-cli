const { exists } = require('@keg-hub/jsutils')
const { getContainerConst } = require('KegUtils/docker/getContainerConst')

/**
 * Checks if a constant env matches the passed in matchValue
 * If no matchValue is passed, then the value is returned
 * @function
 * @param {string} context - The container context to pull the ENVs from
 * @param {string} constant - The ENV constant to check
 * @param {*} matchValue - The value the ENV constant is checked against
 *
 * @returns {boolean} - If the ENV constant matches the matchValue or exists when no matchValue
 */
const checkEnvConstantValue = (context, constant, matchValue) => {
  const value = getContainerConst(context, `ENV.${constant}`)
  return exists(matchValue)
    ? value === matchValue
    : Boolean(value)
}

module.exports = {
  checkEnvConstantValue
}