const docker = require('KegDocCli')
const { getImgFrom } = require('./getImgFrom')
const { get, isObj, noOpObj, isStr, exists } = require('@keg-hub/jsutils')
const { getKegContext } = require('./getKegContext')
const { getSetting } = require('../globalConfig/getSetting')
const { getContainerConst } = require('../docker/getContainerConst')
const { getGlobalConfig } = require('../globalConfig/getGlobalConfig')

/**
 * Gets a tag from the passed in tag param, image, contextEnvs, or the globalConfig default
 * @function
 * @param {string} tag - custom tag to use for a docker image
 * @param {string} context - Current context of the task being run
 * @param {string} [image=''] - Name of the docker image to get the tag for
 *
 * @returns {string} - Found image tag
 */
const getImgTag = (tag, context, image) => {
  return tag ||
    (isStr(image) && image.includes(':') && image.split(':')[1]) ||
    getContainerConst(context, 'env.keg_image_tag', getSetting('docker.defaultTag'))
}

/**
 * Finds the provider and namespace to use based on passed in params and urlSplit
 * @function
 * @param {Array} urlSplit - An image url split at /, with the last item removed
 * @param {string} provider - Custom provider to use for image when pulling or pushing
 * @param {string} namespace - Custom namespace to use for image when pulling or pushing
 *
 * @returns {Object} - Parsed image name data from passed in image url
 */
const getProviderAndNamespace = (urlSplit, provider, namespace) => {

  // Add the provider and namespace if they exist
  const imgData = {}
  provider && (imgData.provider = provider)
  namespace && (imgData.namespace = namespace)

  // If a provider and namespace exist, then we have everything, so return it
  if(provider && namespace) return imgData

  // Otherwise parse out the provider and namespace from the urlSplit
  const [ urlProvider, urlNamespace ] = urlSplit.length > 1
    ? [ urlSplit.shift(), urlSplit.join('/') ]
    : urlSplit

  // Set the provider and namespace if they don't already exist
  !imgData.provider && urlProvider && (imgData.provider = urlProvider)
  !imgData.namespace && urlNamespace && (imgData.namespace = urlNamespace)

  return imgData
}

/**
 * Parses an image url to get the name, provider and namespace
 * @function
 * @param {string} imgUrl - Original url to be parsed
 * @param {string} provider - Custom provider to use for image when pulling or pushing
 * @param {string} namespace - Custom namespace to use for image when pulling or pushing
 *
 * @returns {Object} - Parsed image name data from passed in image url
 */
const getNameFromUrl = (imgUrl, provider, namespace) => {
  // If no url return empty
  if(!imgUrl) return { provider, namespace }

  // If it doesn't include a / then is just a name and not a url
  if(!imgUrl.includes('/')) return { image: imgUrl }

  // Otherwise split the url to get the name and url separated
  const urlSplit = imgUrl.split('/')

  return {
    // Get the last item to get the image name
    image: urlSplit.pop(),
    // Check for more items in the url split to get the provider and namespace
    ...getProviderAndNamespace(urlSplit, provider, namespace)
  }
}

const getTagFromName = (imgName, tag) => {
  // If no image name, just return the tag
  if(!imgName) return { tag }

  // Otherwise try to pull the tag from the imageName if it exists
  const [ image, tagFromName ] = imgName.includes(':')
    ? imgName.split(':')
    : [ imgName ]

  // Create an object to hold the parse image data
  const imgData = { image }
  // Get the param tag or the tag from the image
  const imgTag = tag || tagFromName

  // Add the tag to the image object if it exists
  imgTag && (imgData.tag = imgTag)

  // return the image data object
  return imgData
}

/**
 * Gets the KEG_IMAGE_FROM from the context's ENVs
 * Then parses it to get the image name context information
 * @function
 * @param {string} context - Name of the image name to be parsed
 * @param {Object} params - Options passed to the task from the command line
 *
 * @returns {Object} - Parsed image name data from the KEG_IMAGE_FROM env
 */
const getBaseFromEnv = (context, params) => {
  const baseFromEnv = getImgFrom(params, noOpObj, context)

  // If no baseFrom env, just return
  if(!baseFromEnv) return {}

  // Parse the url, name, tag from the env
  const nameAndUrl = getNameFromUrl(baseFromEnv)
  const nameAndTag = getTagFromName(nameAndUrl.image)

  // Ensure a tag is set, use the default if one does not exist
  nameAndTag.tag = getImgTag(nameAndTag.tag, context, nameAndUrl.image)

  return {
    ...nameAndUrl,
    ...nameAndTag,
  }

}

/**
 * Adds the default provider and namespace if they don't already exist
 * <br/> Also build the image with the tag added and the full tag with all parts
 * @function
 * @param {Object} imgNameWTag - Options passed to the task from the command line
 * @param {string} imgNameWTag.image - Name of the image without out tags or provider
 * @param {string} imgNameWTag.tag - Found tag to use with the image
 * @param {string} [imgNameWTag.provider] - Found provider to use for image when pulling or pushing
 * @param {string} [imgNameWTag.namespace] - Found namespace to use for image when pulling or pushing
 *
 * @returns {Object} - Parse image data
 */
const buildImgVariants = imgNameWTag => {
  imgNameWTag.imageWTag = `${imgNameWTag.image}:${imgNameWTag.tag}`
  imgNameWTag.full = `${imgNameWTag.provider}/${imgNameWTag.namespace}/${imgNameWTag.imageWTag}`
  imgNameWTag.providerImage = `${imgNameWTag.provider}/${imgNameWTag.namespace}/${imgNameWTag.image}`

  return imgNameWTag
}

/**
 * Funds the first truthy value in an array of values
 * @function
 * @param {Object} args - Array of possiable values
 *
 * @returns {Object} - found truthy value or undefined
 */
const findTruthyVal = (...args) => {
  return args.reduce((found, val) => found || val || undefined, undefined)
}

/**
 * @function
 * @param {Object} params - Options passed to the task from the command line
 * @param {Object} imgRef - Docker image reference object
 *
 * @returns {Object} - Updated params with image or passed in params
 */
const checkDockerId = async (params, imgRef) => {
  const { context, image, tag } = params
  const docImg = isObj(imgRef) && imgRef.repository && imgRef.rootId
    ? imgRef
    : docker.isDockerId(image)
      ? await docker.image.get(image)
      : docker.isDockerId(context) && await docker.image.get(context)

  const response = isObj(docImg)
    ? {
        ...params,
        image: docImg.repository || docImg.rootId || image,
        tag: tag || docImg.tag || isArr(docImg.tags) && docImg.tags[0],
      }
    : params

  return response
}

/**
 * Parses the from param into provider/namespace/image/tag params
 * <br/> Overwrites the other params if they exist
 * @function
 * @param {Object} params - Options passed to the task from the command line
 * @param {string} params.image - Original image name or Id of the image
 * @param {string} params.tag - Custom tag to use for the image
 * @param {string} params.provider - Custom provider to use for image when pulling or pushing
 * @param {string} params.namespace - Custom namespace to use for image when pulling or pushing
 *
 * @returns {Object} - Parse image data
 */
const checkFromParam = params => {
  return {
    ...params,
    /*
     * Parse the from param, to get the image and tag
     * The from param will override all other params
     * from param will be overwritten when imgRef is passed to getImgNameContext
     */
    ...(() => {
      const [ image, tag ] = params.from.split(':')
      const [ provider, namespace, imgName ] = image.includes('/')
        ? image.split('/')
        : [ params.provider, params.namespace, image ]

      return {
        tag: tag || params.tag,
        image: imgName || params.image,
        provider: provider || params.provider,
        namespace: namespace || params.namespace,
      }
    })()
  }
}

/**
 * Gets an images provider, namespace, name, and tag from the passed in params or uses defaults
 * <br/> Uses the KEG_IMAGE_FROM env from the contexts values.yml file ENV's
 * @function
 * @param {Object} params - Options passed to the task from the command line
 * @param {string} params.image - Original image name or Id of the image
 * @param {string} params.context - Context of the image being parsed
 * @param {string} params.tap - Name of the tap when context is `tap`
 * @param {string} params.tag - Custom tag to use for the image
 * @param {string} params.provider - Custom provider to use for image when pulling or pushing
 * @param {string} params.namespace - Custom namespace to use for image when pulling or pushing
 * @param {Object} imgRef - Docker image reference object
 *
 * @returns {Object} - Parse image data
 */
const getImgNameContext = async (params, imgRef) => {
  const fromParams = exists(params.from) ? checkFromParam(params) : params

  const {
    tag,
    tap,
    image,
    context,
    provider,
    namespace,
  } = await checkDockerId(fromParams, imgRef)

  // Separate the url, image and tag if needed
  const nameAndUrl = image
    ? getNameFromUrl(image, provider, namespace)
    : {}

  // Get the tag from the image name
  const nameAndTag = getTagFromName(nameAndUrl.image, tag)
  const baseFromEnv = getBaseFromEnv(
    getKegContext(tap || context || nameAndTag.image),
    params,
  )

  const globalConfig = getGlobalConfig()

  // The the image name and tag from the passed in params or KEG_IMAGE_FROM
  return buildImgVariants({
    ...baseFromEnv,
    ...nameAndUrl,
    ...nameAndTag,
    tag: findTruthyVal(
      tag,
      nameAndTag.tag,
      baseFromEnv.tag,
      getSetting('docker.defaultTag'),
    ),
    provider: findTruthyVal(
      provider,
      nameAndUrl.provider,
      baseFromEnv.provider,
      get(globalConfig, 'docker.providerUrl'),
    ),
    namespace: findTruthyVal(
      namespace,
      nameAndUrl.namespace,
      baseFromEnv.namespace,
      get(globalConfig, 'docker.namespace'),
    )
  })
}

module.exports = {
  getImgNameContext
}