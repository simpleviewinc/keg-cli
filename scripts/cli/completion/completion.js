const tasks = require('./tasks.json')
const { get, isEmpty, isStr } = require('@keg-hub/jsutils')
const fs = require('fs-extra')
const path = require('path')

// TODO: 
// * Add in didyoumean3 package for finding matching text strings
// * Fix odd bugs in some cases for alias
// * Write tests

const log = []

const writeData = (args) => {
  fs.writeFileSync(
    path.join(__dirname, './args.txt'),
    args.join(`\n\n`),
    'utf8'
  )
}

const buildTaskPath = (subtasks, args) => {
  let curTasks = subtasks
  let noSubTasks
  return args.reduce((taskPath, arg) => {
    if(noSubTasks) return taskPath

    taskName = isStr(curTasks[arg])
      ? curTasks[arg]
      : arg
    
    log.push(`Task Name: ${arg} => ${taskName}`)
    
    curTasks = curTasks[taskName]
      ? curTasks[taskName].tasks
      : (() => {
          noSubTasks = true
          taskPath = Object.keys(curTasks)
            .reduce((matches, name) => {
              return name.indexOf(taskName) === 0
                ? `${matches} ${name}`
                : matches
            }, '')
            
            log.push(`No Subtasks: ${taskPath}`)

            return taskPath
        })()

    return noSubTasks
      ? taskPath
      : taskPath
        ? `${taskPath}.${taskName}.tasks`
        : `${taskName}.tasks`

  }, '')
}

const completions = () => {

  const args = process.argv.slice(2)
  log.push(`Args: ${args.join(' ')}`)

  // Remove the first argument which should always be `keg`
  args.shift()

  // If no second argument, return the root level tasks
  if(!args.length) return Object.keys(tasks).join(' ')
  log.push(`Args Exist: ${args.join(' ')}`)

  // If more then one argument
  // Add tasks between each argument
  // To allow traversing the task tree
  const taskPath = buildTaskPath(tasks, args)
  log.push(`Task Path: ${taskPath}`)

  if(!taskPath || taskPath.includes(' '))
    return taskPath

  // Then, use get to find the next sub-tasks in the tree
  let subTasks = get(tasks, taskPath)
  log.push(`Sub-Tasks: ${JSON.stringify(subTasks)}`)

  const taskSplit = taskPath.split('.')
  const lastTask = taskSplit[taskSplit.length -2]

  log.push(`Last Task: ${lastTask}`)

  // If no more sub-tasks, use the --help flag
  // Is a fall back when no sub-task is found
  if(!subTasks || isEmpty(subTasks)) return lastTask

  const taskNames = Object.keys(subTasks)
    .reduce((allNames, name) =>{
      return isStr(subTasks[name])
        ? allNames
        : `${allNames} ${name}`
    }, '')

  log.push(`-------- Task Names --------`)
  log.push(`\n${taskNames}`)

  // Join and return the sub-tasks names
  return taskNames
}

const init = () => {
  const taskNames = completions()
  writeData(log)

  return taskNames
}

process.stdout.write(init())
