# Setup the taps image FROM in the global state
# Must come before the FROM directive to is can be accessed
ARG KEG_NODE_VERSION
ARG NODE_IMAGE_FROM=node:$KEG_NODE_VERSION

# Add a FROM for the keg-base image to we can copy content from it
ARG KEG_BASE_IMAGE=ghcr.io/simpleviewinc/keg-base:master
FROM $KEG_BASE_IMAGE as keg-base

# Run the build script keg-core
RUN /keg-setup/build.sh core

# ------- Tap Build Stage ------- #

# Use a multi stage build for security
FROM $NODE_IMAGE_FROM as tap-builder
WORKDIR /

# Add yarn's global bin to PATH
ENV PATH=$PATH:/usr/local/share/.config/yarn/global/node_modules/.bin

# ----------------- TODO: -----------------

# Remove the local copy from the host machine, once the build.sh is merged upstream
# For now, we have to copy it from the current host, so this is commented out
# COPY --from=keg-base /keg-hub/repos/keg-cli/containers/tap/build.sh /keg/tap-build.sh

# Temporary until containers/tap/build.sh exists upstream
# Remove this once that happends

COPY ./build.sh /keg/tap-build.sh

# ----------------- TODO: -----------------

# Copy over required items from the keg-base image
COPY --from=keg-base /usr/local/share/.config/yarn /usr/local/share/.config/yarn
COPY --from=keg-base /keg-hub/repos/keg-cli/containers/tap/run.sh /keg/tap-run.sh
# Copy over the keg-core code with the latest changes
COPY --from=keg-base /keg-hub/repos/keg-core /keg-hub/repos/keg-core

# Install the dependecies with yarn install, then remove the .npmrc
RUN chmod a+x /keg/tap-run.sh; \
    chmod a+x /keg/tap-build.sh; \
    apk add git bash; \
    echo fs.inotify.max_user_watches=1048576 | sudo tee -a /etc/sysctl.conf; \
    sudo sysctl -p; \
    rm -rf /var/cache/apk/*; \
    /bin/sed -i '1s|.*|root:x:0:0:root:/root:/bin/bash|g' /etc/passwd

# Set the current directory to keg-core repo
WORKDIR /keg

# See this comment for an explination
# https://github.com/moby/moby/issues/15025#issuecomment-371466934
# Use the ONBUILD directive to have the lines evaluated on a child image
# It will be executed after `FROM` in the child image, so it's a new build-stage
# Don't set a default values so that the value is set from the build command args of the child
# On build of the child image, run the /keg/tap-build.sh script
ONBUILD ARG DOC_APP_PATH
ONBUILD ENV DOC_APP_PATH=$DOC_APP_PATH

ONBUILD ARG GIT_APP_URL
ONBUILD ENV GIT_APP_URL=$GIT_APP_URL

ONBUILD ARG GIT_APP_BRANCH
ONBUILD ENV GIT_APP_BRANCH=$GIT_APP_BRANCH

ONBUILD RUN /keg/tap-build.sh $DOC_APP_PATH $GIT_APP_URL $GIT_APP_BRANCH

# Run the start script
CMD [ "/bin/bash", "/keg/tap-run.sh" ]
