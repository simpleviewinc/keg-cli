const { Logger } = require('KegLog')
const { get, noOp } = require('@keg-hub/jsutils')
const { validateAction } = require('./validateAction')
const { runActionCmds } = require('KegUtils/actions/runActionCmds')
const { getActionsFromValues } = require('KegUtils/actions/getActionsFromValues')

/**
 * Builds a production app bundle within a docker container
 * @function
 * @param {Object} containerRef - Container ref to load the build action from
 * @param {Object} args - arguments passed from the runTask method
 * @param {Object} templateData - Extra data use when loading the values files as a template
 *
 * @returns {void}
 */
const runBuildAction = async (containerRef, args, templateData=noOp, allowUndefined=false) => {
  const actions = await getActionsFromValues({
    ...args.params,
    container: containerRef,
    __internal: templateData,
  })

  const actionName = get(args, 'params.action', 'tap.build')
  const buildAction = validateAction(
    actions,
    actionName,
    allowUndefined
  )

  return buildAction
    ? await runActionCmds(args, buildAction)
    : Logger.warn(`[ WARNING ] - Could not find action ${actionName}; skipping!\n`)
}


module.exports = {
  runBuildAction
}