module.exports = {
  ...require('./buildComposeCmd'),
  ...require('./buildServiceName'),
  ...require('./checkKillRunning'),
  ...require('./removeInjected'),
  ...require('./getServiceName'),
}