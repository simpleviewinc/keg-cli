# Keg-Hub Cli-Utils
Common utility methods shared across Keg-Hub and Tap repos

## Install
With **yarn**
```bash
yarn add @keg-hub/cli-utils
```
With **npm**
```bash
npm install @keg-hub/cli-utils
```

### Linked Taps Setup
* `runTask` - Find and execute a custom task
  * This method allows custom tasks to be called directly without the need for the `keg-cli`
  * It's recommended to add a call to it in a taps `package.json` under the `scripts` property
    * This allows calling it from a package manager such as `yarn` or `npm` like this =>
      ```js
        // taps package.json file
        "scripts": {
          // ...other scripts
          "task": "node ./node_modules/@keg-hub/cli-utils/src/runTask.js",
        }
      ```
    * This above script can then be called like this => `yarn task <task-name> <task-options>`
      * Assuming a `start` task definition exists, running `yarn task start` will call that task
    * Another option is to import it into a script, then call that script instead
      ```js
        // package.json file
        "scripts": {
          // ...other scripts
          "task": "node ./tasks/runTask.js",
        }

        // tasks/runTask.js file
        const { runTask } = require('@keg-hub/cli-utils')

        // Run some other logic prior to running a task

        runTask()
      ```
  * This method will handle
    * Loading the global config defined at `~/.kegConfig/cli.config.json` if it exists
    * Parsing options relative to a task-definitions `options` property
      * They are then passed to the task as the `params` key of the `args` object  
    * Ensuring the arguments passed to a task match the same arguments passed when using the `keg-cli`
      * This allows custom tasks to work without need to install the `keg-cli`
* `setAppRoot` - Register a taps root directory
  * When using the `keg-cli`, the `setAppRoot` method is **NOT** needed 
  * The `keg-cli` will automatically find the root of a **linked** tap
    * All that's needed is to run `keg tap link <tap-name>` from the taps root
    * Once linked any further `keg-cli` tasks will already know the taps root directory
  * When calling custom tasks outside of the `keg-cli`, calling this method is **highly recommended**
    * It ensures that in `mono-repo` or `sym-linked` situations, the tap root can be properly resolved
    * That said, in **most** cases calling this method is **NOT** needed
      * But, since nothing is inversely affected by it, it's recommended to set it and forget it
      * Add it to the top of a taps `tasks/index.js` file like this =>
        ```js
          const { setAppRoot } = require('@keg-hub/cli-utils')
          setAppRoot(appRoot)

          module.exports = { customTask: { ...taskDefinition } }
        ```
      * See [tap-vistapps-app](https://github.com/lancetipton/tap-visitapps-app/blob/master/tasks/index.js) `tasks/index.js` file for an example
* `registerTasks` - Register Custom Tasks
  * When setup correctly The `keg-cli` will automatically load custom tasks for a linked tap
    * The tap must have a `tasks` folder in the root directory
    * `tasks` folder must have an `index.js`
      * This file should export any custom task definitions that the tap needs
      * See the tasks folders of [tap-visitapps-app](https://github.com/lancetipton/tap-visitapps-app) or [keg-herkin](https://github.com/lancetipton/keg-herkin) for examples
  * In most situations calling `registerTasks` is **NOT** needed
    * This is only for cases where adding a `tasks` folder is **NOT** possible
    * You must call this method prior to running a `keg-cli` command for the tasks to be found
      * It takes a single `Object` argument that should contain key/value pairs task name/definitions
        For example => `registerTasks({ taskName: { ...taskDefinition } })`

### Api
* The library exports a number of utility methods to help with writing custom tasks
* This makes it faster and easier, and removes code duplication across tap tasks

TODO: Add docs for exported utility methods