jest.resetModules()
jest.resetAllMocks()
jest.clearAllMocks()

const { mockTasks } = require('../../../__mocks__/mockTasks')

const { findTask } = require('../findTask')


describe('findTask', () => {

  it('should find the correct task', () => {
    const found1 = findTask(mockTasks, [ 'task1' ])
    expect(found1.task).toEqual(mockTasks.task1)

    const found2 = findTask(mockTasks, [ 'task2' ])
    expect(found2.task).toEqual(mockTasks.task2)

    const found3 = findTask(mockTasks, [ 'task3' ])
    expect(found3.task).toEqual(mockTasks.task3)
  })

  it('should find the correct task from alias', () => {
    const found1 = findTask(mockTasks, [ 't1' ])
    expect(found1.task).toEqual(mockTasks.task1)

    const found2 = findTask(mockTasks, [ 't2' ])
    expect(found2.task).toEqual(mockTasks.task2)

    const found3 = findTask(mockTasks, [ 't3' ])
    expect(found3.task).toEqual(mockTasks.task3)
  })

  it('should find the correct sub task', () => {
    const found12 = findTask(mockTasks, [ 'task1', 'task12' ])
    expect(found12.task).toEqual(mockTasks.task1.tasks.task12)

    const found211 = findTask(mockTasks, [ 'task2', 'task21', 'task211' ])
    expect(found211.task).toEqual(mockTasks.task2.tasks.task21.tasks.task211)
  })

  it('should find the correct sub task from alias', () => {
    const found12 = findTask(mockTasks, [ 't1', 'task12' ])
    expect(found12.task).toEqual(mockTasks.task1.tasks.task12)

    const found211 = findTask(mockTasks, [ 't2', 'task21', 't211' ])
    expect(found211.task).toEqual(mockTasks.task2.tasks.task21.tasks.task211)

    const found31 = findTask(mockTasks, [ 't3', 't31' ])
    expect(found31.task).toEqual(mockTasks.task3.tasks.task31)
  })

})