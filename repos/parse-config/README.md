# Parse-Config
* Helper package for parsing / loading config files with `.yml` and `.env` extensions
* Includes simple template system for dynamically setting config values

## Install
* With `yarn` =>  `yarn add @keg-hub/parse-config`
* With `npm` => `npm install @keg-hub/parse-config`

## Usage
* Require the package in your code as needed
```js
  // Import the entire package
  const PConf = require('@keg-hub/parse-config')
  const ymlObj = await PConf.yml.load(...)
  const envObj = await PConf.env.load(...)
  const templateStr = await PConf.template.fill(...)

  // Import just sections from the package
  const { yml, env, template } = require('@keg-hub/parse-config')
  const ymlObj = await yml.load(...)
  const envObj = await env.load(...)
  const templateStr = await template.fill(...)

  // Import just specific methods from the package
  const { loadYml, loadEnv, fillTemplate } = require('@keg-hub/parse-config')
  const ymlObj = await loadYml(...)
  const envObj = await loadEnv(...)
  const templateStr = await fillTemplate(...)
```
