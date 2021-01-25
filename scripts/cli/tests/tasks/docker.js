const { uuid } = require('@keg-hub/jsutils')
const { spawnCmd, asyncCmd } = require('@keg-hub/spawn-cmd')
const expect = require('expect')

const testUuid = uuid()
let beforeImages
let afterImages

const testImages = [
  'base',
  'core',
  'components',
  'tap'
]

// Docker build tasks to be run
const build = {
  timeout: 100000,
  tasks: testImages.reduce((buildTasks, img) => {
    return buildTasks.concat([
      `${img} build`
    ])
  }, []),
}

// Docker run tasks to be run
const run = {
  tasks: testImages.reduce((runTasks, img) => {
    return runTasks.concat([
      `${img} run --command ls`
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
      await kegCmd(`di rm ${img}`)
      return true
    })

    await Promise.all(promises)

    // List the docker images after clean up
    const { data } = await kegCmdAsync(`di --format json`)
    // Assert the before images with the current images
    const result = expect(beforeImages).toEqual(data)
    // Result is only defined if expect fails, so check if it exists, and print it out
    result && process.stdout.write(result)

    return promises
  },
  runTasks: async (testArray) => {
    await testArray(build)
    await testArray(run)
  }
}

module.exports = {
  docker: dockerTasks,
}