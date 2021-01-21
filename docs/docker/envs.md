
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
  * TODO
* **KEG_DOCKER_EXEC**
  * * TODO
* *more coming soon...*