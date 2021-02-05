const { uuid } = require('@keg-hub/jsutils')
const { spawnCmd, asyncCmd } = require('@keg-hub/spawn-cmd')
const expect = require('expect')
const { logFailed } = require('../helpers/logTests')

const cliTestTag = `automated-cli-tests`
let beforeImages
let afterImages

const testImages = [
  'base',
  'core',
  'components',
  'tap'
]

// Docker build tasks to be run
const buildNPush = {
  timeout: 100000,
  tasks: testImages.reduce((buildTasks, img) => {
    return buildTasks.concat([
      `${img} build --tag ${cliTestTag}`,
      `${img} build --push --tag ${cliTestTag}`,
      `${img} push --build --tag ${cliTestTag}`,
      `${img} push --tag ${cliTestTag}`,
    ])
  }, []),
}

// Docker run tasks to be run
const run = {
  tasks: testImages.reduce((runTasks, img) => {
    return runTasks.concat([
      `${img} run --command ls --tag ${cliTestTag}`
    ])
  }, []),
}



const dockerTasks = {
  beforeTasks: async (kegCmd, kegCmdAsync) => {
    // List the docker images before running tasks
    const { data } = await kegCmdAsync(`di --format json`)
    beforeImages = data
  },
  afterTasks: async (kegCmd, kegCmdAsync) => {
    const promises = testImages.map(async img => {
      await kegCmd(`di tag rm --context ${img} --tag ${cliTestTag}`)
      await kegCmd(`di rm ${img}`)
      return true
    })

    await Promise.all(promises)

    // List the docker images after clean up
    const { data } = await kegCmdAsync(`di --format json`)

    try {
      // Expect the before images to be the same as the current images
      expect(beforeImages).toEqual(data)
    }
    catch(err){
      logFailed({
        parent: 'docker',
        cmd: 'di --format json',
        response: err.stack,
      }, beforeImages, data)
    }

    return promises
  },
  runTasks: async (testArray) => {
    await testArray(buildNPush)
    await testArray(run)
  }
}

module.exports = {
  docker: dockerTasks,
}