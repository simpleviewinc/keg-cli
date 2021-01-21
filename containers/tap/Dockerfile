# Overrights the KEG_BUILD_TYPE arg of the keg-base image
# This tells the ONBUILD drective to use this value when run
ARG KEG_BUILD_TYPE=tap
ARG DOC_APP_PATH=/keg/tap

# Setup the taps image from in the global state
# Must come before the FROM directive to is can be accessed
ARG KEG_NODE_VERSION
ARG NODE_IMAGE_FROM=node:$KEG_NODE_VERSION

# Add a FROM for the keg-base image to we can copy content from it
ARG KEG_IMAGE_FROM=docker.pkg.github.com/simpleviewinc/keg-packages/keg-base:master
FROM $KEG_IMAGE_FROM as keg-base

# ------- Tap Build Stage ------- #

# Use a multi stage build for security
FROM $NODE_IMAGE_FROM as tap-builder
WORKDIR /

# Add yarn's global bin to PATH
ENV PATH=$PATH:/usr/local/share/.config/yarn/global/node_modules/.bin:/keg-cli-setup

# Path of the app within the docker container
ENV DOC_APP_PATH=$DOC_APP_PATH

# Install the dependecies with yarn install, then remove the .npmrc
RUN apk add git bash; \
    echo fs.inotify.max_user_watches=1048576 | sudo tee -a /etc/sysctl.conf; \
    sudo sysctl -p; \
    rm -rf /var/cache/apk/*; \
    /bin/sed -i '1s|.*|root:x:0:0:root:/root:/bin/bash|g' /etc/passwd

# Copy over the globally installed yarn modules 
COPY --from=keg-base /usr/local/share/.config/yarn /usr/local/share/.config/yarn

# Copy over the tap runs script from keg-base
# Then update the permissions of the run script to ensure we can run it
COPY --from=keg-base /keg-hub/repos/keg-cli/containers/tap/run.sh /keg/tap-run.sh
RUN chmod a+x /keg/tap-run.sh

# Copy over the buil tap code from keg base
COPY --from=keg-base $DOC_APP_PATH $DOC_APP_PATH

# Set the current directory to tap repo
WORKDIR $DOC_APP_PATH


SHELL [ "/bin/bash" ]

# Run the start script
CMD [ "/bin/bash", "/keg/tap-run.sh" ]
