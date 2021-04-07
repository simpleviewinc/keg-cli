const { KEG_ENVS } = require('KegConst/envs')

/**
 * Gets the label key for setting a traefik rule
 * @param {string} subdomain - subdomain of the container's traefik url
 * @returns {string} the rule key
 */
const getTraefikRuleKey = (subdomain) => `traefik.http.routers.${subdomain}.rule`

/**
 * @param {string} key - label key
 * @param {string} value - label value
 * @returns {string} the full label parameter string to be passed to docker run command
 */
const buildLabelString = (key, value) => `--label "${key}=${value}"`

/**
 * Returns the opts to pass to the docker run command, updated with labels specific to this
 * environment (e.g. the proxy host url)
 * @param {string} subdomain - container subdomain
 * @param {Array<string>} opts - the current options to be passed to the run command
 * @returns {Object} {
 *  fullProxyUrl: the container's proxy url specific to the environment
 *  builtOpts: updated options list to pass to docker run
 * }
 */
const getOptsWithLabels = (subdomain, opts) => {
  const fullProxyUrl = `${subdomain}.${KEG_ENVS.KEG_PROXY_HOST}`
  const traefikRule = `Host(\`${fullProxyUrl}\`)`
  const key = getTraefikRuleKey(subdomain)
  return {
    fullProxyUrl, 
    builtOpts: [
      ...opts,
      // this label will override any labels with the same key,
      // in opts or on the docker image
      buildLabelString(key, traefikRule)
    ]
  }
}

module.exports = {
  getOptsWithLabels,
}