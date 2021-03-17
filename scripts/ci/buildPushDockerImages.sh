#!/bin/bash

# Exit when any command fails
set -e

# Source the keg-cli so we have access to it
. ../../keg

# Ensure the build tag is set
if [ -z "$KEG_BUILD_TAG" ]; then
  KEG_BUILD_TAG='master'
fi

# Overwrite the defualt tag if the first argument exists
if [ "$1" ]; then
  KEG_BUILD_TAG="$1"
fi

# Log a message to the terminal
keg_message(){
  echo "::debug::[ KEG CLI ] $@"
}

keg_clean_docker(){
  keg_message "Cleaning docker images..."
  keg d clean -f
}

# Build all the keg-hub images 
keg_build_images(){

  # Clear out any old docker images so we start fresh
  keg_clean_docker

  keg_message "Building keg-base:$KEG_BUILD_TAG image..."
  keg base build --push --tag $KEG_BUILD_TAG --no-cache

  keg_message "Building keg-core:$KEG_BUILD_TAG image..."
  keg core build --push --tag $KEG_BUILD_TAG --no-cache

  keg_message "Building keg-components:$KEG_BUILD_TAG image..."
  keg components build --push --tag $KEG_BUILD_TAG --no-cache

  keg_message "Building tap:$KEG_BUILD_TAG image..."
  keg tap build --push --tag $KEG_BUILD_TAG --no-cache
}

# Kick off the image builds and pushes
keg_build_images