
const mockTasks = {
  task1: {
    name: 'task1',
    alias: ['t1'],
    tasks: {
      task11: {
        name: 'task11',
        alias: ['t11'],
      },
      task12: {
        name: 'task12',
        alias: ['t12'],
      }
    }
  },
  task2: {
    name: 'task2',
    alias: ['t2'],
    tasks: {
      task21: {
        name: 'task21',
        alias: ['t21'],
        tasks: {
          task211: {
            name: 'task211',
            alias: ['t211'],
            tasks: {
              task211: {
                name: 'task211',
                alias: ['t2111'],
              }
            }
          }
        }
      },
    }
  },
  task3: {
    name: 'task3',
    alias: ['t3'],
    tasks: {
      task31: {
        name: 'task31',
        alias: ['t31'],
      },
      task32: {
        name: 'task32',
        alias: ['t32'],
      }
    }
  },

}

module.exports = {
  mockTasks
}