# Setup keg-components image FROM in the global state
# Must come before the FROM directive to is can be accessed
ARG KEG_NODE_VERSION
ARG NODE_IMAGE_FROM=node:$KEG_NODE_VERSION

# Add a FROM for the keg-base image to we can copy content from it
ARG KEG_BASE_IMAGE=ghcr.io/simpleviewinc/keg-base:master
FROM $KEG_BASE_IMAGE as keg-base

# Run the build script keg-components
RUN /keg-cli-setup/build.sh components

# ------- Components Image Build Stage ------- #

# Use a multi stage build for security
FROM $NODE_IMAGE_FROM as keg-components
WORKDIR /

# # Add yarn's global bin to PATH
ENV PATH=$PATH:/usr/local/share/.config/yarn/global/node_modules/.bin

# Copy over required items from the keg-base image
COPY --from=keg-base /usr/local/share/.config/yarn /usr/local/share/.config/yarn
COPY --from=keg-base /keg-hub/repos/keg-cli/containers/components/run.sh /keg/components-run.sh

# Update the permissions of the run script
# Install the dependecies with yarn install
RUN chmod a+x /keg/components-run.sh; \
    apk add --no-cache git bash sudo; \
    echo fs.inotify.max_user_watches=1048576 | sudo tee -a /etc/sysctl.conf; \
    sudo sysctl -p; \
    rm -rf /var/cache/apk/*; \
    /bin/sed -i '1s|.*|root:x:0:0:root:/root:/bin/bash|g' /etc/passwd

# Path of the app within the docker container
ARG DOC_APP_PATH=/keg/keg-components
ENV DOC_APP_PATH=$DOC_APP_PATH

# Set the current directory to keg-core repo
WORKDIR $DOC_APP_PATH

# Copy keg-components repo from the keg-base image
COPY --from=keg-base /keg-hub/repos/keg-components $DOC_APP_PATH

# Run the start script
CMD [ "/bin/bash", "/keg/components-run.sh" ]
