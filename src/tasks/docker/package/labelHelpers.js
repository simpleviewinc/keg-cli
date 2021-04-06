const parseLabel = labelData => {
  const [ key, valuePath, label ] = labelData
  const value = get(args.contextEnvs, key.toUpperCase(), get(args, valuePath))
  return { key, value, valuePath, label }
}

const getLabelForKey = key => {
  const labelData = proxyLabels.find(data => data.key.toUpperCase() === key)
  return parseLabel(labelData)
}

const getTraefikRuleKey = (subdomain) => `traefik.http.routers.${subdomain}.rule`
const buildLabelString = (key, value) => `--label "${key}=${value}"`

/**
 * Returns labels with the proxy host update
 * @param {string} host - host domain e.g. local.kegdev.xyz
 * @param {Object} imgLabels - current labels on image
 * @returns 
 */
const getOptsWithLabels = (subdomain, domain, buildOpts) => {
  const fullProxyUrl = `${subdomain}.${domain}`
  const traefikRule = `Host(\`${fullProxyUrl}\`)`
  const key = getTraefikRuleKey(subdomain)
  return {
    fullProxyUrl, 
    builtOpts: [
      ...buildOpts,
      buildLabelString(key, traefikRule)
    ]
  }
}

module.exports = {
  getOptsWithLabels,
  getLabelForKey,
  parseLabel
}