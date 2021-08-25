
const asENV = item => ('${' + item +  '}')

const kegShared = `      - com.keg.env.cmd=${asENV('KEG_EXEC_CMD')}
      - com.keg.env.port=${asENV('TAP_PROXY_PORT')}
      - com.keg.path.context=${asENV('KEG_CONTEXT_PATH')}
      - com.keg.path.container=${asENV('DOC_APP_PATH')}
      - com.keg.path.compose=${asENV('KEG_COMPOSE_DEFAULT')}
      - com.keg.path.values=${asENV('KEG_VALUES_FILE')}
      - com.keg.path.docker=${asENV('KEG_DOCKER_FILE')}`

const generatedLabels = {
  core: `      - com.keg.env.context=keg-core
${kegShared}
      - com.keg.proxy.domain=core
`,
      injected: `      - com.keg.env.context=tap-injected-test
${kegShared}
      - com.keg.proxy.domain=injected
`
}


module.exports = {
  generatedLabels,
}