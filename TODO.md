### CLI TODOs

**Taps**
  * Create a default init template for a tap - `create-react-tap`

**Install**
* Keg cli should be installed through `yarn global` || `npm global`
  * Should run `/scripts/setup/setup-<platform>`
    * Based on platform after install
    * Currently only supports bash
    * Need to add for windows `.bat` || Rewrite in `node`
  * Should run `scripts/setup/cliSetup.js`
    * Sets up cli on the local machine


### TODO: 
  * Keg repos should be installed through an install command
    * Should use the globalConfig to set the install location
    * Should allow overwriting the globalConfig location
      * If location is overwritten, location should be updated in global config
  * Auto clean up docker images / cache
    * Figure out how to call this in the background as tasks are called
  * Look into building tap images without the name tap

BUG: 
* Fix tests to no rely on globalConfig values
  * Users can customize their config values, which means tests will fail


### Issues
* `from` option is not overwriting KEG_IMAGE_FROM 
* docker compose restart task, not restarting
* Temp files not being removed
  * Injected docker-compose.yml config files are not being properly removed when the service is killed
* Pushed latest master image, did not pull down the most recent version
  * Have to delete the local version, and re-download the latest image from provider