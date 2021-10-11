# Setup keg-core image FROM in the global state
# Must come before the FROM directive to is can be accessed
ARG KEG_NODE_VERSION
ARG NODE_IMAGE_FROM=node:$KEG_NODE_VERSION

# Add a FROM for the keg-base image to we can copy content from it
ARG KEG_BASE_IMAGE=ghcr.io/lancetipton/keg-base:develop
FROM $KEG_BASE_IMAGE as keg-base

ARG KEG_COPY_LOCAL
ENV KEG_COPY_LOCAL=$KEG_COPY_LOCAL

# Copy over the local keg-core code
COPY . /keg-temp/keg-core

# Check if we should replace the git version with the local version
# Afterwards, remove the temp folder to keep image size down
RUN if [ "$KEG_COPY_LOCAL" ]; then \
      if [ -d "/keg-hub/repos/keg-core" ]; then \
        rm -rf /keg-hub/repos/keg-core; \
      fi; \
      mv /keg-temp/keg-core /keg-hub/repos/keg-core; \
    fi; \
    rm -rf /keg-temp/keg-core

# Run the build script keg-core
RUN /keg-setup/build.sh core

# ------- Components Image Build Stage ------- #

# Use a multi stage build for security
FROM $NODE_IMAGE_FROM as keg-core
WORKDIR /

# # Add yarn's global bin to PATH
ENV PATH=$PATH:/usr/local/share/.config/yarn/global/node_modules/.bin

# Copy over required items from the keg-base image
COPY --from=keg-base /usr/local/share/.config/yarn /usr/local/share/.config/yarn
COPY --from=keg-base /keg-hub/repos/keg-cli/containers/core/run.sh /keg/core-run.sh

# Update the permissions of the run script
# Install the dependecies with yarn install
RUN chmod a+x /keg/core-run.sh; \
    apk add --no-cache git bash sudo; \
    echo fs.inotify.max_user_watches=1048576 | sudo tee -a /etc/sysctl.conf; \
    sudo sysctl -p; \
    rm -rf /var/cache/apk/*; \
    /bin/sed -i '1s|.*|root:x:0:0:root:/root:/bin/bash|g' /etc/passwd

# Path of the app within the docker container
ARG DOC_APP_PATH=/keg/keg-core
ENV DOC_APP_PATH=$DOC_APP_PATH

# Set the current directory to keg-core repo
WORKDIR $DOC_APP_PATH

# Copy keg-core repo from the keg-base image
COPY --from=keg-base /keg-hub/repos/keg-core $DOC_APP_PATH

ARG KEG_PROXY_PORT=19006
EXPOSE $KEG_PROXY_PORT

# Run the start script
CMD [ "/bin/bash", "/keg/core-run.sh" ]
