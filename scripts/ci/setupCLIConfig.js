#!/usr/bin/env node

/**
 * @summary - Sets up the required config files for the Keg-CLI
 *          - Saves config files to the host machine relative to the KEG_CONFIG_PATH env
 *
 * @example
 * GITHUB_TOKEN=12345 NODE_ENV=ci KEG_CUSTOM_PATH=../custom/config.json node ./scripts/ci/setupCLIConfig.js
 *
 * @envs
    * GITHUB_TOKEN - Token to allow interacting with the github API
    * KEG_CLI_PATH - Path to the Keg-CLI repo
      * If not set, will use the root folder relative to the file ( i.e. ../../ )
    * KEG_CONFIG_FILE - Name of the global config file to create
      * Default is cli.config.json
    * KEG_CONFIG_PATH - Folder Location where the cli config files should be saved
      * Default is <KEG_CLI_PATH env>/.kegConfig
    * KEG_CUSTOM_PATH - Custom Keg-CLI config file path
      * Path must be relative to the Keg-CLI root directory
      * Config file can be JSON, or a .js file
      * If using .js file; it must export an object, or a function that returns an object
    * NODE_ENV - Will be used as the default environment for the keg-cli
 *
 * @returns {void}
*/

require('module-alias/register')

const path = require('path')
const fs = require('fs-extra')
const ciConfig = require('./ci.config.json')
const { deepMerge, isFunc } = require('@keg-hub/jsutils')

const {
  GITHUB_TOKEN,
  KEG_CLI_PATH=path.join('../../'),
  KEG_CONFIG_FILE=`cli.config.json`,
  KEG_CONFIG_PATH=path.join(KEG_CLI_ROOT, '.kegConfig'),
  KEG_CUSTOM_PATH,
  KEG_ROOT_DIR,
  NODE_ENV,
  USER,
} = process.env


const loadCustomConfig = () => {
  if(!KEG_CUSTOM_PATH) return {}

  try {
    const customConfig = require(path.join(KEG_CLI_PATH, KEG_CUSTOM_PATH))
    return isFunc(customConfig)
      ? customConfig()
      : customConfig
  }
  catch(err){
    console.error(err.message)
    throw new Error(
      `Error loading config ${KEG_CUSTOM_PATH}.\nPath must be relative to the Keg-CLI root dir!`
    )
  }

}

const buildCIConfig = (customConfig) => {
  return deepMerge(ciConfig, {
    cli: {
      paths: {
        cli: KEG_CLI_PATH,
        containers: path.join(KEG_CLI_PATH, 'containers'),
        kegConfig: KEG_CONFIG_PATH,
        keg: KEG_ROOT_DIR,
      },
      git: {
        orgName: `simpleviewinc`,
        orgUrl: `https://github.com/simpleviewinc`,
        publicToken: GITHUB_TOKEN,
        key: GITHUB_TOKEN,
        user: "keg-admin",
        repos: {
          cli: `keg-cli`,
          hub: `keg-hub`,
        }
      },
      settings: {
        defaultEnv: NODE_ENV || ciConfig.cli.settings.defaultEnv,
      }
    },
    docker: {
      providerUrl: `ghcr.io`,
      namespace: `simpleviewinc`,
      user: USER,
      token: GITHUB_TOKEN
    },
  }, customConfig)
}


(async () => {

  // Ensure the global keg config folder path exists
  process.stdout.write(`::debug::Creating directory ${KEG_CONFIG_PATH}\n`)
  !fs.existsSync(KEG_CONFIG_PATH) && fs.mkdirSync(KEG_CONFIG_PATH)
 
  const ciENVFrom = path.join(__dirname, 'ci.env')
  const ciENVTo = path.join(KEG_CONFIG_PATH, 'defaults.env')

  // Copy over the CI defaults.env file
  process.stdout.write(`::debug::Creating ci.env file at path ${ciENVTo}\n`)
  fs.copySync(ciENVFrom, ciENVTo) 

  // Try to load a custom config file
  const customConfig = {} //loadCustomConfig()
  const globalConfig = buildCIConfig(customConfig)
  
  process.stdout.write(`::debug::Docker User is ${globalConfig.docker.user}\n`)
  process.stdout.write(`::debug::Default Env is ${globalConfig.cli.settings.defaultEnv}\n`)
  
  const ciConfigTo = path.join(KEG_CONFIG_PATH, KEG_CONFIG_FILE)

  // Build then wright the cli config file to the config path
  process.stdout.write(`::debug::Creating ci cli.config.json file at path ${ciConfigTo}\n`)
  fs.writeFileSync(
    ciConfigTo,
    JSON.stringify(globalConfig, null, 2),
    'utf8'
  )

  process.stdout.write(`::debug::Finished creating Keg-CLI config files!\n`)

})()