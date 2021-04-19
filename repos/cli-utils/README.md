# Keg-CLI-Utils
Utility methods to help with creating custom Keg-CLI Tasks

### Install
With **yarn**
```bash
yarn add @keg-hub/keg-cli-utils
```
With **npm**
```bash
npm install @keg-hub/keg-cli-utils
```

### Setup
Register Tasks
  * This library exports a helper method called `registerTasks`
  * You must call this method first before running any task
    * It takes a single `Object` argument that containers all custom task definitions

```js
// Beginning of your code
const { registerTasks } = require('@keg-hub/keg-cli-utils')
registerTasks({
  /* ...Custom task definitions */
})

// ...reset of your code

```