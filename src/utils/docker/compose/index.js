module.exports = {
  ...require('./buildComposeCmd'),
  ...require('./getComposeConfig'),
  ...require('./loadComposeConfig'),
  ...require('./removeInjectedCompose'),
}