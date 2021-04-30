const path = require('path')
const rootDir = path.join(__dirname, '../../')
const { makeExecutable } = require('./makeExecutable')
const { installRepos } = require('./installRepos')

;(async () => {

  // Makes <root_dir>/keg executable
  await makeExecutable(rootDir, 'keg')

  // Makes <root_dir>/keg-cli executable
  await makeExecutable(rootDir, 'keg-cli')

  // Finds all sub-repos with a package.json
  // Then runs yarn install on them
  installRepos()

})()