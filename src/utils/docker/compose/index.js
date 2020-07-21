module.exports = {
  ...require('./addExposedPorts'),
  ...require('./buildComposeCmd'),
  ...require('./buildServiceName'),
  ...require('./checkKillRunning'),
  ...require('./loadComposeConfig'),
  ...require('./removeInjected'),
  ...require('./getServiceName'),
  ...require('./getServiceVolumes'),
}