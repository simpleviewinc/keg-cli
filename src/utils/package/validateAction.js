const { get, isStr, isObj } = require('@keg-hub/jsutils')
const { generalError } = require('KegUtils/error/generalError')
const { throwMissingAction } = require('KegUtils/error/throwMissingAction')

/**
 * Validates an action to ensure it exists and has cmds to run
 * @function
 * @param {Object} actions - All actions loaded from the Values.yml files
 * @param {Object|string} actionRef - String path to an action in the actions or an action object
 *
 * @returns {Object} - Found and validated action object
 */
const validateAction = (actions, actionRef, allowUndefined) => {
  const action = isStr(actionRef)
    ? get(actions, actionRef)
    : isObj(actionRef)
      ? actionRef
      : generalError(`An action object or string path reference is required`)

  // Should only get here is actionRef is a string, and it's not found in the actions object
  if(!action)
    return allowUndefined
      ? false
      : throwMissingAction(`actions.${actionRef}`)

  // Ensure there are commands to run for the action
  return  (!action.cmds || !action.cmds.length) && !action.cmd
    ? generalError(
        `The cmd or cmds property of the action is missing or empty!`,
        `At least one command is required to run the action.`,
        actionRef
      )
    : action
}


module.exports = {
  validateAction
}