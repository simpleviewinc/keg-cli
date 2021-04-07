
const methods = [
  'data',
  'dir',
  'error',
  'fail',
  'info',
  'log',
  'success',
  'text',
  'warn',
  'green',
  'red',
  'yellow',
  'cyan',
  'magenta',
  'blue',
  'gray',
  'clear',
  'color',
  'empty',
  'header',
  'highlight',
  'label',
  'log',
  'pair',
  'print',
  'setColors',
  'spaceMsg',
  'spacedMsg',
  'stderr',
  'stdout',
  'subHeader',
  'table',
]

const Logger = methods.reduce((logObj, method) => {
  logObj[method] = jest.fn()
  return logObj
}, {})

module.exports = {
  Logger
}