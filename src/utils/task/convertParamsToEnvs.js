const { getSetting } = require('../globalConfig/getSetting')
const { exists, toBool, isStr } = require('@keg-hub/jsutils')
const { getImgNameContext } = require('KegUtils/getters/getImgNameContext')

/**
 * Gets the copy local flag from params || container ENVs || cli settings
 * @function
 * 
 * @param {boolean} local - Copy local flag, passed from the command line
 * @param {object} copyLocalEnv - Copy local flag, set in the container ENVs
 * 
 * @returns {boolean}
 */
const getCopyLocal = (local, copyLocalEnv) => {
  return exists(local)
    ? toBool(local)
    : exists(copyLocalEnv)
      ? toBool(copyLocalEnv)
      : toBool(getSetting('docker.defaultLocalBuild'))
}

const getImageFromParam = async (extraENVs, params) => {
  const imgNameContext = await getImgNameContext(params)

  return {
    ...extraENVs,
    KEG_IMAGE_FROM: imgNameContext.full,
    KEG_IMAGE_TAG: imgNameContext.tag,
  }
}

/**
 * Builds the env object for the container
 * 
 * @function
 * @param {object} params - Formatted arguments passed to the current task
 * @param {object} copyLocalEnv - Copy local flag, set in the container ENVs
 * @returns {object}
 */
const convertParamsToEnvs = async (params, copyLocalEnv) => {
  const { env, command, install, local, from } = params
  const extraENVs = {}

  env && ( extraENVs.NODE_ENV = env )
  command && ( extraENVs.KEG_EXEC_CMD = command )
  install && ( extraENVs.KEG_NM_INSTALL = true )

  // Check if we should copy the local repo into the docker container on image build
  getCopyLocal(local, copyLocalEnv) && ( extraENVs.KEG_COPY_LOCAL = true )

  // Check if the from param is passed in, and if so, get the image meta data from it
  return isStr(from)
    ? await getImageFromParam(extraENVs, params)
    : extraENVs

}

module.exports = {
  convertParamsToEnvs
}