
### Docker Build
* By default taps build from the `keg-base` image
  * This can be overriden through the `KEG_IMAGE_FROM` env
  * If overriding also set the `KEG_FROM_BASE` env to false
    * This bypasses pull the keg-base image before running the taps docker image

### KEG_EXEC_CMD vs KEG_DOCKER_EXEC
* TODO - explain difference and reasoning for them

### ENV Functionality
* **DOC_APP_PATH**
  * Path to the application within the docker image or container
  * Definition
    * **@required**
    * @type *String*
    * @cli-option `N/A`
* **KEG_BUILD_TYPE**
  * Defines the type of docker image being built
  * This allows the keg-base `build.sh` script to which keg-hub repos should be installed
  * Uses the `ONBUILD` directive to help keep images sizes small
  * Definition
    * @type *string*
    * @cli-option `n/a`
* **KEG_COPY_LOCAL**
  * Copy the local docker context into the docker image at build time
    * The Dockerfile for the image must support the `KEG_COPY_LOCAL` env
  * Definition
    * @type *Boolean*
    * @cli-option `--local`
* **KEG_IMAGE_FROM**
  * The image name the current image should be built from *(base image)*
    * The Dockerfile for the image must support the `KEG_IMAGE_FROM` env
  * Definition
    * @optional *Uses keg-base image by default*
    * @type *String*
    * @cli-option `--from`
* **KEG_IMAGE_TAG**
  * Tag to use when interacting with a docker image
  * Definition
    * @optional
    * @type *String*
    * @cli-option `--tag`
* **KEG_FROM_BASE**
  * Disable pulling the keg-base image before running a docker image
  * Definition
    * @optional
    * @type *Boolean*
    * @cli-option `N/A`
* **IMAGE**
  * Name used for the Docker Image after it has been built *(repository)*
  * Definition
    * **@required**
    * @type *string*
    * @cli-option `N/A`
* **KEG_EXEC_CMD**
  * The command within the container to call when running the `docker exec command`
    * Most tap's `Dockerfile` defines running the `container/run.sh` script when starting
    * The `container/run.sh` script then uses `KEG_EXEC_CMD` as the `yarn` script to be run
      * Looks something like `yarn <KEG_EXEC_CMD>`
    * This ENV will be **ignored**, unless configure in a fashion similar to above
  * Definition
    * @optional
    * @type *String*
    * @cli-option `--exec`
* **KEG_AUTO_DOCKER_EXEC***
  * Disables calling docker exec command after starting the docker container
  * Must explicitly set to `false`
  * Definition
    * @optional
    * @type *Boolean*
    * @cli-option `N/A`
* **KEG_AUTO_SYNC**
  * Disables creating a mutagen sync from a tap's folder and the docker container
  * Must explicitly set to `false`
  * Definition
    * @optional
    * @type *Boolean*
    * @cli-option `N/A`
* **KEG_USE_PROXY**
  * Disables keg-proxy container check when executing a task
  * Must explicitly set to `false`
  * Definition
    * @optional
    * @type *Boolean*
    * @cli-option `N/A`
* **KEG_BASE_IMAGE**
  * The base image to build a tap image
  * Should be the full url of the image if using a provider other then the `dockerhub.io` default
  * Typically it should look similar to `ghcr.io/simpleviewinc/tap:master`
  * Setting it to `node:12.19-alpine` would pull the image from `dockerhub.io`, which is the default
  * Definition
    * @required
    * @type *String*
    * @cli-option `--from` (docker build task only)

* *more coming soon...*