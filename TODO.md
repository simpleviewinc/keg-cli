### CLI TODOs

### Image FROM
* Docker build command separate from the docker compose
  * Build image, then push image
  * Docker cli commands only
* Docker-compose
  * config files `image` property should point to the full docker provider url
  * They should not point to the local image without the provider url
  * They should include a tag, default is master
  * When docker compose command is run,
    * The image property should be dynamically set by
      * --from prop from the command line
      * KEG_IMAGE_FROM env set the context values.yml file
      * The default KEG_IMAGE_FROM value for the context type
        * `base` === `<provider-url>/keg-base:master`
        * `components` === `<provider-url>/keg-components:master`
        * `core` === `<provider-url>/keg-core:master`
        * `tap` === `<provider-url>/tap:master`
      * Tag can be overwritten with
        * `--tag` option form command line
        * KEG_IMAGE_TAG env
* Docker packages
  * These should create new images from the currently running images
  * They should use the current branch name for the tag
    * This should override the default tag
  * This would also allow running the docker image with compose by setting the --tag option from the command line
    * This would work the same as docker packages currently do, only through docker-compose not docker 

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

### Image pull
  * If a tap is passed in
    * Get the tap location locally
    * From the location get the git remote info
      * This will allow getting the branch / repo name data
      * Use this find the correct package after the have been pulled from github

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


Docker-Compose
  * Injected docker-compose.yml config files are not being properly removed when the service is killed