ARG KEG_NODE_VERSION
ARG KEG_NODE_IMAGE=node:$KEG_NODE_VERSION
FROM $KEG_NODE_IMAGE as keg-builder

WORKDIR /

# Add git so we can pull down keg-repos
RUN apk --no-cache add git; \
    yarn global add expo-cli@$EXPO_CLI_VERSION nodemon --pure-lockfile

# ---- Setup keg-hub within the container ---- #

# Get the git keg-hub url and branch to pull down
ARG GIT_HUB_URL=https://github.com/simpleviewinc/keg-hub.git
ARG GIT_HUB_BRANCH=develop

# Pull down the keg-hub repo from github
RUN git clone --single-branch --branch $GIT_HUB_BRANCH $GIT_HUB_URL /keg-hub

# ---- Setup the keg-cli in the container ---- #

# Get the git keg-hub url and branch to pull down
ARG GIT_CLI_URL=https://github.com/simpleviewinc/keg-cli.git
ARG GIT_CLI_BRANCH=master

# Pull down the keg-cli
RUN git clone --single-branch --branch $GIT_CLI_BRANCH $GIT_CLI_URL /keg-hub/repos/keg-cli; \
    mkdir -p /keg-cli-setup; \
    cp -r /keg-hub/repos/keg-cli/containers/base/* /keg-cli-setup/

# TODO: Remove this out once the file have been merge into the upstream
# Copy over the local keg-cli setup files
COPY ./repos/keg-cli/containers/base/build.sh /keg-cli-setup/build.sh
COPY ./repos/keg-cli/containers/base/keg-exec.sh /keg-cli-setup/keg-exec.sh
COPY ./repos/keg-cli/containers/base/cli.config.json /keg-cli-setup/cli.config.json
COPY ./repos/keg-cli/containers/base/defaults.env /keg-cli-setup/defaults.env

# ------- Final Build Stage ------- #

# Use a multi stage build for security
FROM $KEG_NODE_IMAGE AS final-build

# Add the keg-exec folder to the path, so we can find our keg-cli exec script
ENV PATH=$PATH:/usr/local/share/.config/yarn/global/node_modules/.bin:/keg-cli-setup

# Install git, docker-cli and bash for the new stage
RUN apk add git docker-cli bash; \
    echo fs.inotify.max_user_watches=1048576 | sudo tee -a /etc/sysctl.conf; \
    sudo sysctl -p; \
    rm -rf /var/cache/apk/*; \
    /bin/sed -i '1s|.*|root:x:0:0:root:/root:/bin/bash|g' /etc/passwd; \
    mkdir -p /root/.kegConfig; \
    mkdir -p /keg-temp/keg-exec

# Copy over the globally installed modules from above
COPY --from=keg-builder /usr/local/share/.config/yarn /usr/local/share/.config/yarn

# Copy over the keg-cli setup files
COPY --from=keg-builder /keg-cli-setup /keg-cli-setup

# Copy over keg hub from keg-builder build stage
COPY --from=keg-builder /keg-hub /keg-hub

# Copy over the keg-exec script nad update the permissions so we can execute it
RUN mkdir -p /root/.kegConfig; \
    mv /keg-cli-setup/cli.config.json /root/.kegConfig/cli.config.json; \
    mv /keg-cli-setup/defaults.env /root/.kegConfig/defaults.env; \
    chmod +x /keg-cli-setup/keg-exec.sh; \
    chmod +x /keg-cli-setup/build.sh

WORKDIR /keg-hub

# See this comment for an explination
# https://github.com/moby/moby/issues/15025#issuecomment-371466934
# Use the ONBUILD directive to have the lines evaluated in a child image
# This will define the `ARG` inside the build-stage
# (it will be executed after `FROM` in the child image, so it's a new build-stage)
# don't set a default value so that the value is set from the build command args
ONBUILD ARG KEG_BUILD_TYPE

# use ONBUILD directive to call the build.sh script inside the child image
# This allows the child image to define the value of KEG_BUILD_TYPE
ONBUILD RUN /keg-cli-setup/build.sh $KEG_BUILD_TYPE

# Set the defualt shell to bash
SHELL [ "/bin/bash"]

# Run the bash for the default command
CMD [ "/bin/bash" ]