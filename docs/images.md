# Docker Images Workflow

### Overview
  * In most cases, images should not be built locally
  * Images should be built in the cloud, for example a `github workflow`
  * When an image is needed locally, it should pulled from a provider
  * They can built manually if needed by running the build task
    * This is how we would create the initial image for a new tap
    * Or if changes to how an existing image is built, is needed

### Base Image
  * Should only be needed locally when:
    * You need to change how an image is built
    * You are building a new image for a tap
  * All images use the base image, but only when being built
    * All images should be built in the CI (except new ones)
  * Anytime there are changes pushed to the `keg-hub` master branch
    * A new base image is built
    * Using this new base image, new keg-hub images are built
    * This process should be automated inside a github action

### Process 
* Build base image with master tag
  * This is the starting point for all other images
* Build base images for keg-hub repos with default tag ( master )
  * They should all use the `base:develop` image in the `FROM` of the Dockerfile
  * Images include `keg-core`, `keg-components`, `tap`

### Taps
  * In most cases taps should use the `tap:develop` image as it's base
    * This should be defined with the `KEG_BASE_IMAGE` env
      * It should include the image name and tag
  * For creating a new Tap
    * Define the container folder, and add the required files
    * Manually build a new image
      * Even in this case, the base image should be pulled from the provider first
      * It should not need to build the base image locally
    * Tag it with `master`, then push it to your provider
      * This should happen automatically
    * All further development should just pull that image

### Workflow
  * **Pushing an Image**
    * Should automatically tag an image with the correct tag ( git branch / default tag )
      * This will allow the image to be different from PR images when testing PRs
    * Use the `keg docker package` || `keg dpg` (shortcut) to push an image with changes
      * This is exactly the same as before
    * Only use the `push` task directly when the `<image-base>:develop` image needs to be updated
  * **Running an Image**
    * Should automatically pull from the docker provider any time an image is started
    * Should pull the most recent version of the `KEG_IMAGE_FROM` from the provider
      * In most cases this would be the `master` tagged version

### Important ENVS
  * `KEG_BASE_IMAGE`: ghcr.io/simpleviewinc/tap:develop
    * Image to use when building a tap
    * Docker will use this image when building the image
    * Should be `tap:develop` in most cases
      * This is default, but can be over written (i.e. Keg-Herkin)
  * `KEG_IMAGE_FROM`: ghcr.io/simpleviewinc/<tap-name>:develop
    * Image to use when running a tap
    * Docker Compose will use this image when starting the container

### Image Tags
  * New Images should use the current branch as the tag name
    * For example `keg-core:develop, keg-components:my-branch-name, tap:develop`
  * This allows for images in PR's to be `auto-updated` as needed
    * This can be done through a github action whenever changes are pushed to that branch with an open PR
    * We would no longer have to manually commit, and push images for our PR requests
  * This also allows for them to work consistently with the `keg-proxy`
    * Which uses the branch name within the dynamically built url
  * Other tags can be added, but they should only be used for reference if needed

### Building/Testing Images Locally
  * Most of the time, you shouldn't need to do this
  * But when you make changes that require building a new image, such as by making changes to the Dockerfile, you can follow this workflow
    * Build the image, tag it, and push it to the registry
      * example: `keg evf build --tag my-changes-tag --push`
    * Then, to test it, run the package locally using the `--from` flag:
      * example: `keg evf start --from evf:my-changes-tag`
      * ensure you use the same branch as the one you were on when you ran `build`, otherwise the mutagen sync will overwrite changes within the docker container
