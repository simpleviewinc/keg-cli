module.exports = {
  ...require('./buildComposeCmd'),
  ...require('./buildComposeName'),
  ...require('./checkKillRunning'),
  ...require('./removeInjected'),
}