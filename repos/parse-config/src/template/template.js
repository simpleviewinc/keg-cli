const { throwError } = require('../error/throwError')
const { readFile, readFileSync } = require('fs-extra')
const { template, limbo } = require('@keg-hub/jsutils')

/**
 * Default template replace pattern
 * @type {RegEx}
 */
let defPattern = /{{([^}]*)}}/g

/**
 * Overrides the default template replace pattern
 * @function
 * @param {RegEx} pattern - Pattern for matching items to be replaced
 *
 * @returns {void}
 */
const setDefaultPattern = (pattern) => {
  defPattern = pattern || defPattern
}

/**
 * Override the default replace pattern
 * @function
 * @private
 * @param {RegEx} pattern - Template pattern to override the default
 * 
 * @returns {void}
 */
const setTemplateRegex = (pattern) => {
  template.regex = pattern || /{{([^}]*)}}/g
}

/**
 * Sets the correct template pattern, then fills the template, then resets the template pattern
 * @function
 *
 * @param {string} tmp - Template to be filled
 * @param {Object} data - Data used to fill the template
 * @param {RegEx} pattern - Template pattern to override the default
 *
 * @returns {string} - Template with the content filled from the passed in data
 */
const execTemplate = (tmp, data, pattern) => {
  // Set the template regex to ensure it uses the passed in pattern or default
  setTemplateRegex(pattern)

  // Fill the template with the data object
  const filled = template(tmp, data)

  // Reset the template regex pattern after the template is filled
  setTemplateRegex()

  return filled
}


/**
 * Loads and fills a template from the passed in data
 * @param {Object} args - Arguments to load an fill the template
 *
 * @param {string} args.location - Location of the template file on the host machine
 * @param {string} args.template - Template to be filled
 * @param {Object} args.data - Data used to fill the template
 * 
 * @returns {string} - Template with the content filled from the passed in data
 */
const fillTemplate = async ({ location, template:tmp, data={}, pattern }) => {
  const [ err, toFill ] = tmp
    ? [null, tmp]
    : await limbo(readFile(location))

  return err ? throwError(err) : execTemplate(toFill, data, pattern)
}

/**
 * Reads the passed in location or template, and replaces content with values from the dat object
 * @function
 * @param {string} args.location - Location of the template file on the host machine
 * @param {string} args.template - Template to be filled
 * @param {Object} args.data - Data used to fill the template
 *
 * @returns {string} - Template with the content filled from the passed in data
 */
const fillTemplateSync = ({ location, template:tmp, data={}, pattern }) => {
  return execTemplate(
    tmp || readFileSync(location),
    data,
    pattern
  )
}


module.exports = {
  execTemplate,
  fillTemplate,
  fillTemplateSync,
  template: {
    exec: execTemplate,
    fill: fillTemplate,
    fillSync: fillTemplateSync,
    setDefaultPattern,
  }
}