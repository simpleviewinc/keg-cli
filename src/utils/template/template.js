const path = require('path')
const { KegTpl } = require('KegTpl')
const { getFiles } = require('KegFileSys')
const { CLI_ROOT } = require('KegConst/constants')
const { generalError } = require('../error/generalError')
const { fillTemplate:PFillTemplate, fillTemplateSync } = require('KegPConf')

// Cache holder for our templates
let __TEMPLATES

/**
 * Maps template files to their name from th keg-cli/src/templates folder
 * Caches the templates to the __TEMPLATES variable
 *
 * @returns {Object} - Mapped templates by file name
 */
const mapTemplatesToName = async () => {
  if(__TEMPLATES) return __TEMPLATES

  // If templates has not been loaded, then load them 
  const templateFiles = await getFiles(KegTpl, { filters: [ 'index.js' ] })

  // Format the found template files to map to the file name
  __TEMPLATES = templateFiles.reduce((mapped, file) => {
    const name = file.split('.').shift()
    mapped[name] = path.join(KegTpl, file)

    return mapped
  }, {})

  return __TEMPLATES
}

/**
 * Loads a template by name, by loading all files in the template folder
 * <br/> Then using the passed in name, finds the template with the same name
 * @param {string} name - Name of the template
 * @param {Object} data - Data to fill the template
 *
 * @returns {string} - Loaded template, with it's content filled
 */
const loadTemplate = async (name, data={}) => {
  const templates = await mapTemplatesToName()
  const location = templates[name]

  return location
    ? PFillTemplate({ location, data })
    : generalError(`Template with name "${name}" does not exist!`)
}

/**
 * Loads and fills a template from the passed in data
 * @param {Object} args - Arguments to load an fill the template
 *
 * @returns {string} - Template with the content filled from the passed in data
 */
const fillTemplate = ({ template, loc, data={}, root }) => {
  return fillTemplateSync({
    data,
    template,
    location: root ? path.join(CLI_ROOT, loc) : loc,
  })
}


module.exports = {
  fillTemplate,
  loadTemplate
}