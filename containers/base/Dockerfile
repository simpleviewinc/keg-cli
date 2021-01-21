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
    mkdir -p /keg-setup; \
    cp -r /keg-hub/repos/keg-cli/containers/base/* /keg-setup/

# TODO: Remove this out once the file have been merge into the upstream
# Copy over the local keg-cli setup files
COPY ./repos/keg-cli/containers/base/build.sh /keg-setup/build.sh
COPY ./repos/keg-cli/containers/base/keg-exec.sh /keg-setup/keg-exec.sh
COPY ./repos/keg-cli/containers/base/cli.config.json /keg-setup/cli.config.json
COPY ./repos/keg-cli/containers/base/defaults.env /keg-setup/defaults.env

# ------- Final Build Stage ------- #

# Use a multi stage build for security
FROM $KEG_NODE_IMAGE AS final-build

# Add the keg-exec folder to the path, so we can find our keg-cli exec script
ENV PATH=$PATH:/usr/local/share/.config/yarn/global/node_modules/.bin:/keg-setup

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
COPY --from=keg-builder /keg-setup /keg-setup

# Copy over keg hub from keg-builder build stage
COPY --from=keg-builder /keg-hub /keg-hub

# Copy over the keg-exec script nad update the permissions so we can execute it
RUN mkdir -p /root/.kegConfig; \
    mv /keg-setup/cli.config.json /root/.kegConfig/cli.config.json; \
    mv /keg-setup/defaults.env /root/.kegConfig/defaults.env; \
    chmod +x /keg-setup/keg-exec.sh; \
    chmod +x /keg-setup/build.sh

WORKDIR /keg-hub

# Run the bash for the default command
CMD [ "/bin/bash" ]