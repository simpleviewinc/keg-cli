#!/bin/sh

EMPTY="EMPTY"
KEG_REPOS="/keg-hub/repos"
KEG_JSUTILS_BUILT="false"
KEG_RESOLVER_BUILT="false"
KEG_RETHEME_BUILT="false"
KEG_COMPONENTS_BUILT="false"
KEG_CORE_BUILT="false"

# Git clones a repo into the dock container
keg_clone_repo(){
  # If a branch is defined then only pull that branch
  if [ "$3" ]; then
    git clone --single-branch --branch $3 $1 $2 

  # Otherwise just clone the repo
  else
    git clone $1 $2
  fi
}

# Sets up a repo by installing, building, cleaning up, then coping to a location
keg_setup_repo(){
  # Install dependecies
  if [ "$1" ] && [ -d "$1" ]; then
    cd $1
    yarn install --pure-lockfile
  fi

  # Build the repo
  if [ "$2" == "build" ]; then
    yarn build
  fi

  # Remove node_modules after build
  if [ "$3" == "remove" ]; then
    rm -rf $1/node_modules
  fi
}

# Copies files or folders from one path to another
keg_copy_to_path(){
  # Copy over the repo files to a parent repo
  if [ "$2" ]; then

    # Check if the build folder exists and use it if it exists
    if [ -d "$2/build" ]; then
      rm -rf $2/build
      cp -R $1/build $2/build

    # Check if the src folder exists and use it if it exists
    elif [ -d "$2/src" ]; then
      rm -rf $2/src
      cp -R $1/src $2/src

    # Otherwise copy over the whole folder
    elif [ -d "$2" ]; then
      rm -rf $2
      cp -R $1 $2
    fi
  fi
}

# Install / Build jsutils, then copy over it's keg dependencies
keg_build_jsutils(){
  if [ "$KEG_JSUTILS_BUILT" == "false" ] && [ -d "$KEG_REPOS/jsutils" ]; then
    keg_setup_repo "$KEG_REPOS/jsutils" "build" "remove"
    KEG_JSUTILS_BUILT="true"
  fi

  # Copy jsutils to the parent repo
  if [ "$1" ]; then
    keg_copy_to_path "$KEG_REPOS/jsutils" "$1"
  fi
}

# Install / Build tap-resolver, then copy over it's keg dependencies
keg_build_resolver(){
  if [ "$KEG_RESOLVER_BUILT" == "false" ] && [ -d "$KEG_REPOS/tap-resolver" ]; then

    # Shortcut to the tap-resolver keg-hub node_modules folder
    local KEG_HUB_NM="$KEG_REPOS/tap-resolver/node_modules/@keg-hub"

    # Setup the tap-resolver
    keg_setup_repo "$KEG_REPOS/tap-resolver"

    # Setup jsutils for tap-resolver
    keg_build_jsutils "$KEG_HUB_NM/jsutils"

    KEG_RESOLVER_BUILT="true"
  fi

  # Copy tap-resolver to the parent repo
  if [ "$1" ]; then
    keg_copy_to_path "$KEG_REPOS/tap-resolver" "$1"
  fi
}

# Install / Build re-theme, then copy over it's keg dependencies
keg_build_retheme(){
  if [ "$KEG_RETHEME_BUILT" == "false" ] && [ -d "$KEG_REPOS/re-theme" ]; then

    # Shortcut to the re-theme keg-hub node_modules folder
    local KEG_HUB_NM="$KEG_REPOS/re-theme/node_modules/@keg-hub"

    # Setup the re-theme
    keg_setup_repo "$KEG_REPOS/re-theme"

    # Then setup jsutils for the re-theme
    keg_build_jsutils "$KEG_HUB_NM/jsutils"
    KEG_RETHEME_BUILT="true"
  fi

  # Copy tap-resolver to the parent repo
  if [ "$1" ]; then
    keg_copy_to_path "$KEG_REPOS/re-theme" "$1"
  fi
}

# Install / Build keg-components, then copy over it's keg dependencies
keg_build_components(){
  if [ "$KEG_COMPONENTS_BUILT" == "false" ] && [ -d "$KEG_REPOS/keg-components" ]; then

    # Shortcut to the keg-components keg-hub node_modules folder
    local KEG_HUB_NM="$KEG_REPOS/keg-components/node_modules/@keg-hub"

    # Setup the keg-components
    keg_setup_repo "$KEG_REPOS/keg-components"

    # Setup jsutils for keg-components
    keg_build_jsutils "$KEG_HUB_NM/jsutils"

    # Setup the re-theme for keg-components
    keg_build_retheme "$KEG_HUB_NM/re-theme"

    KEG_COMPONENTS_BUILT="true"
  fi

  # Copy tap-resolver to the parent repo
  if [ "$1" ]; then
    keg_copy_to_path "$KEG_REPOS/keg-components" "$1"
  fi
}

# Install / Build keg-core, then copy over it's keg dependencies
keg_build_core(){
  if [ "$KEG_CORE_BUILT" == "false" ] && [ -d "$KEG_REPOS/keg-core" ]; then
    # Shortcut to the keg-core keg-hub node_modules folder
    local KEG_HUB_NM="$KEG_REPOS/keg-core/node_modules/@keg-hub"

    # Setup the keg-core
    keg_setup_repo "$KEG_REPOS/keg-core"

    # Setup jsutils for keg-core
    keg_build_jsutils "$KEG_HUB_NM/jsutils"

    # Setup tap-resolver for keg-core
    keg_build_resolver "$KEG_HUB_NM/tap-resolver"

    # Setup re-theme for keg-core
    keg_build_retheme "$KEG_HUB_NM/re-theme"

    # Setup keg-components for keg-core
    keg_build_components "$KEG_REPOS/keg-components"

    KEG_CORE_BUILT="true"
  fi

  # Copy tap-resolver to the parent repo
  if [ "$1" ]; then
    keg_copy_to_path "$KEG_REPOS/keg-core" "$1"
  fi
}

# Install / Build keg-cli, then copy over it's keg dependencies
keg_build_cli(){
  # Install keg-cli, then copy over it's keg dependencies
  if [ -d "$KEG_REPOS/keg-cli" ]; then
    cd $KEG_REPOS/keg-cli
    yarn install --pure-lockfile

    # Shortcut to the keg-cli keg-hub node_modules folder
    local KEG_HUB_NM="$KEG_REPOS/keg-cli/node_modules/@keg-hub"
  
    # Setup all child repos inside keg-cli with their latest build or src files
    keg_build_jsutils "$KEG_HUB_NM/jsutils"
    keg_copy_to_path "$KEG_REPOS/args-parse" "$KEG_HUB_NM/args-parse"
    keg_copy_to_path "$KEG_REPOS/ask-it" "$KEG_HUB_NM/ask-it"
    keg_copy_to_path "$KEG_REPOS/spawn-cmd" "$KEG_HUB_NM/spawn-cmd"
  fi
}

# Install / Build Tap, then copy over it's keg dependencies
keg_build_tap(){

  # Ensure the DOC_APP_PATH is set
  if [[ -z "$DOC_APP_PATH" ]]; then
    DOC_APP_PATH=/keg/tap
  fi

  # Clone the tap repo from git
  keg_clone_repo $GIT_APP_URL $DOC_APP_PATH $GIT_APP_BRANCH

  # Setup the tap
  keg_setup_repo "$DOC_APP_PATH"

  # Check if the keg-core folder exists
  if [ -d "$DOC_APP_PATH/node_modules/keg-core" ]; then
    # Setup keg-core for the tap
    keg_build_core "$DOC_APP_PATH/node_modules/keg-core"
  fi

}

keg_build_repos_from_type(){

  if [[ -z "$1" ]]; then
    keg_build_tap

  elif [[ "$1" == "cli" ]]; then
    keg_build_cli

  elif [[ "$1" == "core" ]]; then
    keg_build_core

  elif [[ "$1" == "components" ]]; then
    keg_build_components
  fi

}

keg_build_repos_from_type "$@"