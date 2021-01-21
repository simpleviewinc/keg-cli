#!/bin/sh

# Git clones a repo into the dock container
keg_clone_tap(){
  # If a branch is defined then only pull that branch
  if [ "$3" ]; then
    git clone --single-branch --branch $3 $1 $2 

  # Otherwise just clone the repo
  else
    git clone $1 $2
  fi
}

# Install / Build Tap, then copy over it's keg-core dependencies
keg_setup_tap(){

  # Install the node_modules if a package.json exists
  if [[ -f "$DOC_APP_PATH/package.json" ]]; then
    yarn install --pure-lockfile
    yarn cache clean
  fi

  # Helper to the keg-hub and taps keg-core folders
  local TAP_CORE_PATH="$DOC_APP_PATH/node_modules/keg-core"
  local HUB_CORE_PATH="/keg-hub/repos/keg-core"

  # Check if keg-core exists at both locations
  # Then copy over the updated keg-core to the tap
  if [[ -d "$TAP_CORE_PATH" ]] && [[ -d "$HUB_CORE_PATH" ]]; then
    # First taps keg-core folder
    rm -rf $TAP_CORE_PATH
    # Move the update keg-core into the taps node_modules 
    mv -R $HUB_CORE_PATH $TAP_CORE_PATH
  fi

  # Temp workaround for expo until we are able to update the expo version
  if [[ -d "$TAP_CORE_PATH/.expo" ]]; then
    rm -rf $TAP_CORE_PATH/.expo
  fi

}

# Install / Build Tap, then copy over it's keg dependencies
keg_build_tap(){

  # Normalize DOC_TAP_PATH
  if [[ "$DOC_TAP_PATH" ]]; then
    DOC_APP_PATH=$DOC_TAP_PATH
  fi

  # Ensure the DOC_APP_PATH is set
  if [[ -z "$DOC_APP_PATH" ]]; then
    DOC_APP_PATH=/keg/tap
  fi

  # More to the taps directory
  cd $DOC_APP_PATH

  # Normalize GIT_TAP_URL && GIT_TAP_BRANCH
  if [[ "$GIT_TAP_URL" ]]; then
    GIT_APP_URL=$GIT_TAP_URL
  fi

  if [[ "$GIT_TAP_BRANCH" ]]; then
    GIT_APP_BRANCH=$GIT_TAP_BRANCH
  fi

  if [[ "$GIT_APP_URL" ]]; then
    # Clone the tap repo from git
    keg_clone_tap $GIT_APP_URL $DOC_APP_PATH $GIT_APP_BRANCH
  fi

  # Setup the tap
  keg_setup_tap "$DOC_APP_PATH"

}

keg_build_tap "$@"