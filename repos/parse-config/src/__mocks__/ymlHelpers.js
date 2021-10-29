const path = require('path')
const writeYamlFile = require('write-yaml-file')
const { limbo } = require('@keg-hub/jsutils')
const { pathExistsSync, remove } = require('fs-extra')
const testYmlPath = path.join(__dirname, './ymlTest.yml')
const testYmlWrite = path.join(__dirname, './ymlWriteTest.yml')
const testYmlJsonPath = path.join(__dirname, './ymlJsonTemplateTest.yml')

const testYmlData = {
  test: [ 'baz', 'foo' ],
  bar: { 'sub-content': { more: ['"item:item"'] } },
}

const testYmlStr = `
test:
  - baz
  - foo
bar:
  sub-content:
    more:
      - '"item:item"'
`.trim()

const removeYmlTest = async () => {
  await removeYmlFile(testYmlPath)
  await removeYmlFile(testYmlWrite)
}

const writeYmlTest = async (file, data) => {
  await removeYmlTest()
  await writeYmlFile(testYmlPath, testYmlData)
}

const removeYmlFile = async file => {
  return pathExistsSync(file) && (await remove(file))
}

const writeYmlFile = async (file, data) => {
  await limbo(removeYmlFile(file))
  return limbo(writeYamlFile(file, data))
}

const removeYmlJson = async () => {
  return await removeYmlFile(testYmlJsonPath)
}

module.exports = {
  removeYmlFile,
  removeYmlJson,
  removeYmlTest,
  testYmlJsonPath,
  testYmlPath,
  testYmlWrite,
  writeYmlTest,
  writeYmlFile,
  testYmlStr,
}
