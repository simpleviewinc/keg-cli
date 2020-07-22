#!/usr/bin/env

# apt remove docker-ce docker-ce-cli
# apt install docker-ce=18.06.1~ce~3-0~ubuntu

set -e
trap 'echo "Finished with exit code $?"' EXIT

# Github Repos
KEG_CLI_URL=github.com/simpleviewinc/keg-cli.git

# Check if the keg root dir has been set. If not, then set it
if [[ -z "$KEG_ROOT_DIR" ]]; then
  export KEG_ROOT_DIR=$HOME/keg
fi

export KEG_CLI_PATH=$KEG_ROOT_DIR/keg-cli
export KEG_GLOBAL_PATH=$HOME/.kegConfig

NODE_VERSION=12.15.0
DOCKER_IP=192.168.99.101
COMPOSE_VERSION=1.26.2
BASH_FILE=~/.bashrc

KEG_USER="$USER"
KEG_GROUP="$(id -g -n $KEG_USER)"
KEG_EXIT=""

# Ensure a .bashrc file exists
if [[ ! -f "$BASH_FILE" ]]; then
  # Create the file if it does not exist
  keg_message ".bashrc file not found, creating at $BASH_FILE"
  touch $BASH_FILE
fi

# Prints a message to the terminal through stderr
keg_message(){
  echo "[ KEG CLI ] $@" >&2
  return
}

# Asks a question in the terminal
keg_ask_question(){
  keg_message "$1"
  read -p "" INPUT;
  local ANSWER="${INPUT:0:1}"

  echo "$ANSWER"
}

# ------------ Local Machine Setup ------------ #

# Update and install some deps
keg_setup_apt_get(){
  sudo apt-get update
  sudo apt-get install -y apt-transport-https ca-certificates curl gnupg-agent software-properties-common
}

# Check and install homebrew - Yes, even on linux :)
keg_brew_install(){
  # Check for brew install
  if [[ -x "$(command -v brew 2>/dev/null)" ]]; then
    keg_message "Brew is installed"
    return

  #  Install brew
  else
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"

  fi

  # Check if is in the .bashrc already, and if not, add it
  if grep -Fq ":/home/linuxbrew/.linuxbrew/bin" "$BASH_FILE"; then
    keg_message "Brew is already in your \$PATH"

  # If not in the .bashrc, add it
  else
    keg_message "Adding brew to \$PATH in $BASH_FILE"
    echo "" >> $BASH_FILE
    echo "export PATH=\"\$PATH:/home/linuxbrew/.linuxbrew/bin\"" >> $BASH_FILE
    echo "" >> $BASH_FILE
  fi

}

# ------------ Docker Setup ------------ #

# Adds the docker machine-envs to the current session
keg_add_machine_envs(){

  keg_message "Loading docker-machine envs"
  local KEG_DM_ENVS=$KEG_CLI_PATH/scripts/setup/docker-machine.env

  # Ensure the env file exists
  if [[ -f "$KEG_DM_ENVS" ]]; then
    keg_message "Setting docker-machine envs" >&2
    # Load the docker-machine ENVs, but route the output to dev/null
    # This way nothing is printed to the terminal
    set -o allexport
    source $KEG_DM_ENVS >/dev/null 2>&1
    set +o allexport
  else
    # Print message, and direct to stderr, so it's not captured in stdout
    keg_message "Missing ENV file as $KEG_DM_ENVS" >&2
    keg_message  "Can not run setup script" >&2
  fi

}

# Install Docker
keg_install_docker(){
  
  if [[ -x "$(command -v docker 2>/dev/null)" ]]; then
    keg_message "Docker is installed"
  else
    keg_message "Installing docker..."
    # sudo apt-get install --reinstall docker-ce
    /bin/sh -c "$(curl -fsSL https://get.docker.com)"
    sudo usermod -aG docker $USER
    newgrp docker

    keg_setup_static_ip
  fi

}

# Set the docker host in ~/.bashrc
keg_set_docker_host(){

  # Check if the keg cli is installed, and if not, add it to bash file
  if grep -Fq "export DOCKER_HOST=tcp://localhost:2375" "$BASH_FILE"; then
    keg_message "DOCKER_HOST already added to $BASH_FILE"

  else
    keg_message "Adding DOCKER_HOST to $BASH_FILE"
    echo "export DOCKER_HOST=tcp://localhost:2375" >> ~/.bashrc
    source ~/.bashrc

  fi

}

# Set the docker ip address
keg_setup_static_ip(){
  
  local DAEMON_PATH=/etc/docker/daemon.json
  
  # Check if the docker static ip is already set, and if not, add it to bash file
  if grep -Fq "$DOCKER_IP/24" "$DAEMON_PATH"; then
    keg_message "Docker IP apready set!"
    return

  # Update the IP tables to use the correct static ip
  else

    # ip addr show docker0
    # dockerd --bip=192.168.99.101/24 --default-gateway=192.168.99.1
    # export DOCKER_HOST="$(ip -4 addr show docker0 | grep -Po 'inet \K[\d.]+')"
    # RUN echo "nameserver 8.8.8.8">/etc/resolv.conf
    keg_message "Stoping $KEG_DOCKER_NAME to set static ip address..."

    sudo service docker stop
    
    # Update the IP tables
    iptables -t nat -F POSTROUTING
    ip link set dev docker0 down
    ip addr del 172.17.42.1/16 dev docker0
    ip addr add 192.168.99.101/24 dev docker0
    ip link set dev docker0 up
    
    echo "{ \"storage-driver\": \"devicemapper\", \"bip\": \"$DOCKER_IP\", \"default-gateway\": \"192.168.99.1\" }" > /etc/docker/daemon.json
    
    keg_message "Starting $KEG_DOCKER_NAME with ip address => $KEG_DOCKER_IP"
    sudo service docker start

  fi

}

# Install docker-compose
keg_install_compose(){

  if [[ -x "$(command -v docker-compose 2>/dev/null)" ]]; then
    keg_message "Docker-compose is installed"

  # Download and install docker-compose biniary
  else
    keg_message "Installing docker-compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/$COMPOSE_VERSION/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

    # Update the permissions
    sudo chmod +x /usr/local/bin/docker-compose

  fi

}

# ------------ Dependacies Setup ------------ #

# Source NVM, so it can be accessed in the terminal
keg_source_nvm(){

  export NVM_DIR="$HOME/.nvm"

  if [[ -s "$NVM_DIR/nvm.sh" ]]; then
    . "$NVM_DIR/nvm.sh"
  fi

  if [[ -s "$NVM_DIR/bash_completion" ]]; then
    . "$NVM_DIR/bash_completion"
  fi

}

# Check and install nvm and node
keg_install_nvm_node(){

  if [[ -d "$HOME/.nvm" ]]; then

    keg_message "NVM already installed!"
    keg_source_nvm

    local CURRENT_VER="$(nvm current)"
    if [[ "$CURRENT_VER" !=  "v$NODE_VERSION" ]]; then
      nvm install $NODE_VERSION
    fi
    
  else

    keg_message "Installing NVM"

    # Download and run the bash install script
    curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash

    # Set up NVM to be used right away
    keg_source_nvm

    # Install the node version
    nvm install $NODE_VERSION
  fi

}

# Check and install yarn
keg_install_yarn(){
  # Check for yarn install
  if [[ -x "$(command -v yarn 2>/dev/null)" ]]; then
    keg_message "Yarn is installed"
  else

    keg_message "Installing yarn..."
    curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
    sudo apt update
    sudo apt install --no-install-recommends yarn
    
    export PATH="$PATH:`yarn global bin`"
    echo "alias nodejs=nodejs" >> ~/.bashrc
    source ~/.bashrc
    # 
    
  fi
}

# Adds act package, which allows testing github actions locally through docker
keg_install_github_cli(){

  # Check for yarn install
  if [[ -x "$(command -v gh 2>/dev/null)" ]]; then
    keg_message "Github CLI is installed"
  else
    brew install github/gh/gh
  fi

}

# Sets up and installs mutagen for syncing folders
keg_install_mutagen(){
  if [[ -x "$(command -v mutagen 2>/dev/null)" ]]; then
    keg_message "Mutagen is installed"
  else
    brew install mutagen-io/mutagen/mutagen
  fi
}

# ------------ CLI Setup ------------ #

# Close a github repo locally
# Tries to use the $GITHUB_KEG if it exists, othwise tries to clone without it
keg_install_repo(){

  # Check if the path already exists
  if [[ -d "$2" ]]; then
    keg_message "Skipping git clone of '$2 repo'. Folder already exists!"
    return
  fi

  local USE_GIT_KEY
  # Check if there is GITHUB_KEY || GIT_KEY in the ENV, and is so use it to clone the repos
  if [[ "$GITHUB_KEY" ]]; then
    USE_GIT_KEY=$GITHUB_KEY

  elif  [[ "$GIT_KEY" ]]; then
    USE_GIT_KEY=$GIT_KEY

  fi

  # Check if USE_GIT_KEY is set, and is so use it to clone the repos
  if [[ "$USE_GIT_KEY" ]]; then
    git clone --recurse-submodules https://$USE_GIT_KEY@$1 $2
  
  # Otherwise use the a regular git clone, without the key
  else
    git clone --recurse-submodules https://$1 $2
  fi

  # Navigate to the repo, and update that it's a shared repo in the config
  cd $2
  git reset --hard HEAD
  git config core.sharedRepository group

}

# Installs the keg-cli, and clones the keg-core / keg-componets repos locally
# Updates the bash_profile to source the keg-cli when loaded!
keg_check_cli_dirs(){

  # Check if the keg-cli install directory exists
  # If not, then create it, and set it's permissions to the current user/group
  if [[ ! -d "$KEG_ROOT_DIR" ]]; then
    keg_message "Creating /keg directory..."
    sudo mkdir -p $KEG_ROOT_DIR
    
    sudo chown -R $KEG_USER:$KEG_GROUP $KEG_ROOT_DIR
  fi

  cd $KEG_ROOT_DIR

  if [[ ! -d "$KEG_CLI_URL" ]]; then
    # Clone the needed key repos
    keg_install_repo $KEG_CLI_URL keg-cli
  fi

  # Update the bash profile to include the keg-cli bash commands
  keg_check_bash_file

}

# Install the dependencies for the keg-cli
keg_install_cli_dependencies(){

  local KEG_CLI_DEPS="$KEG_CLI_PATH/node_modules"
  local HAS_DEPS=""
  if [[ -d "$KEG_CLI_DEPS" ]]; then
    HAS_DEPS="$(ls -A $KEG_CLI_DEPS)"
  fi
  
  if [[ -z "$HAS_DEPS" ]]; then
    keg_message "Installing KEG-CLI node dependencies..."

    # Cache the current diretory
    local CUR_DIR=$(pwd)

    # Navigate to the keg-cli directory
    cd $KEG_CLI_PATH

    # Install the dependencies
    yarn install

    # Navigate back to the original directory
    cd $CUR_DIR
    
  else
    keg_message "KEG-CLI node dependencies already installed"
  fi

}

# Ensure keg-cli is added to the path
keg_add_to_path(){
  mkdir -p /keg/keg-cli/bin
  ln -s $HOME/keg/keg-cli/keg $HOME/keg/keg-cli/bin/keg
  ln -s $HOME/keg/keg-cli/keg-cli $HOME/keg/keg-cli/bin/keg-cli
  
  export PATH="$PATH:$HOME/.local/bin:$HOME/keg/keg-cli/bin"
}

# Runs the node KEG-CLI config setup script
keg_cli_config_setup(){
  node $KEG_CLI_PATH/scripts/cli/configSetup.js
}

# Check and create the global config folder if it doesn't exist
keg_check_global_config(){

  # Ensure global cli config folder exists
  if [[ ! -d "$KEG_GLOBAL_PATH" ]]; then
    keg_message "Creating global config folder at $KEG_GLOBAL_PATH"
    mkdir -p $KEG_GLOBAL_PATH
    mkdir -p $KEG_GLOBAL_PATH/.tmp
  fi

}

# Checks the bash_profile and bashrc files for entries of the keg-cli
# If not found, it will add it; and reload the bash file
keg_check_bash_file(){

  keg_message "Checking bash profile for KEG-CLI..."

  # Check if the keg cli is installed, and if not, add it to bash file
  if grep -Fq $KEG_CLI_PATH/keg "$BASH_FILE"; then
    keg_message "KEG-CLI already added to $BASH_FILE"
  else

    # TODO: Add check for NVM => export NVM_DIR=
    # The entry for the keg should come before the NVM entry
    # We need to load the keg-cli and $GIT_KEY before loading NVM

    keg_message "Adding KEG-CLI to $BASH_FILE"
    echo "" >> $BASH_FILE
    echo "source $KEG_CLI_PATH/keg" >> $BASH_FILE

  fi

}

# Runs methods to setup the keg-cli, with docker and vagrant
# Params
#   * $1 - (Optional) - Section of the setup script to run
#     * If it does not exist, all setup sections are run
keg_setup(){

  # Determin the setup type
  local SETUP_TYPE=$1

  # To run:
  # bash ubuntu-init.sh
  #  * Full install
  #  * Should be run when first setting up the machine
  #  * Running `bash ubuntu-init.sh init` will do the same thing
  if [[ -z "$SETUP_TYPE" || "$SETUP_TYPE" == "init" ]]; then
    INIT_SETUP="true"
  fi

  # Setup and install apt-get dependencies
  # To run:
  # bash ubuntu-init.sh apt
  if [[ -z "$KEG_EXIT" ]] && [[ "$INIT_SETUP" || "$SETUP_TYPE" == "apt" ]]; then
    keg_message "Updating apt-get..."
    keg_setup_apt_get "${@:2}"
  fi


  # Setup and install brew
  # To run:
  # bash ubuntu-init.sh brew
  if [[ -z "$KEG_EXIT" ]] && [[ "$INIT_SETUP" || "$SETUP_TYPE" == "brew" ]]; then
    keg_message "Checking for brew install..."
    keg_brew_install "${@:2}"
  fi

  # Setup and install docker
  # To run:
  # bash ubuntu-init.sh docker
  if [[ -z "$KEG_EXIT" ]] && [[ "$INIT_SETUP" || "$SETUP_TYPE" == "docker" ]]; then
    keg_message "Checking for docker install..."
    keg_install_docker "${@:2}"
  fi

  # Setup and install docker-compose
  # To run:
  # bash ubuntu-init.sh compose
  if [[ -z "$KEG_EXIT" ]] && [[ "$INIT_SETUP" || "$SETUP_TYPE" == "compose" ]]; then
    keg_message "Checking for docker-compose install..."
    keg_install_compose "${@:2}"
  fi


  # Add the keg-cli/bin to the users path
  # To run:
  # bash ubuntu-init.sh docker
  if [[ -z "$KEG_EXIT" ]] && [[ "$INIT_SETUP" || "$SETUP_TYPE" == "compose" ]]; then
    keg_message "Check for nvm and node install...."
    keg_install_nvm_node "${@:2}"
  fi


  # Setup and install github cli
  # To run:
  # bash ubuntu-init.sh gh
  if [[ -z "$KEG_EXIT" ]] && [[ "$INIT_SETUP" || "$SETUP_TYPE" == "gh" ]]; then
    keg_message "Checking for github cli install..."
    keg_install_github_cli
  fi

  # Setup and install machine
  # To run:
  # bash ubuntu-init.sh machine
  if [[ -z "$KEG_EXIT" ]] && [[ "$INIT_SETUP" || "$SETUP_TYPE" == "mutagen" || "$SETUP_TYPE" == "sync" ]]; then
    keg_message "Checking if mutagen is setup..."
    keg_install_mutagen "${@:2}"
  fi

  # Setup and install yarn
  # To run:
  # bash ubuntu-init.sh yarn
  if [[ -z "$KEG_EXIT" ]] && [[ "$INIT_SETUP" || "$SETUP_TYPE" == "yarn" ]]; then
    keg_message "Checking for yarn install..."
    keg_install_yarn "${@:2}"
  fi

  # Setup and install cli
  # To run:
  # bash ubuntu-init.sh cli
  if [[ -z "$KEG_EXIT" ]] && [[ "$INIT_SETUP" || "$SETUP_TYPE" == "cli" ]]; then
    keg_message "Checking KEG-CLI install..."
    keg_check_cli_dirs "${@:2}"
  fi

  # Setup and install cli deps
  # To run:
  # bash ubuntu-init.sh nm
  if [[ -z "$KEG_EXIT" ]] && [[ "$INIT_SETUP" || "$SETUP_TYPE" == "node_modules" ]]; then
    keg_message "Checking KEG-CLI node dependencies..."
    keg_install_cli_dependencies
  fi

  if [[ -z "$KEG_EXIT" ]] && [[ "$INIT_SETUP" || "$SETUP_TYPE" == "config" ]]; then
    keg_message "Running KEG-CLI config setup..."
    keg_cli_config_setup "${@:2}"

    if [[ "$SETUP_TYPE" == "config" ]]; then
      return
    fi

  fi

  # If exit error is set, print and return
  if [[ "$KEG_EXIT" ]]; then
    echo "[ KEG ERROR ] $KEG_EXIT" >&2
    return
  fi

  echo ""
  keg_message "--------------------------------------------- [ KEG CLI ]"
  echo ""
  echo "                       Keg CLI setup complete!"
  echo "                        Run source ~/.bashrc"
  echo "            Or open a new terminal window to use the it!"
  echo ""
  keg_message "--------------------------------------------- [ KEG CLI ]"
  echo ""

}

# Initializes the setup, then calls keg_setup to install everything
keg_init_setup(){

  # Check that the keg-cli directories have been setup
  keg_check_cli_dirs
  
  # Check that the global config folder exists
  keg_check_global_config

  # Unset these envs so we can validate that the current envs get loaded
  unset KEG_DOCKER_IP
  unset KEG_DOCKER_NAME

  # Re-add all machine envs including $KEG_DOCKER_IP && $KEG_DOCKER_NAME
  keg_add_machine_envs

  # Ensure the ENVs were reset, so we can properly setup the keg-cli
  # $KEG_DOCKER_IP && $KEG_DOCKER_NAME should now be reset from keg_add_machine_envs
  if [[ "$KEG_DOCKER_IP" && "$KEG_DOCKER_NAME" ]]; then
    keg_setup "$@"

  # Show message if setup ENVs could not be set
  else
    keg_message "Error running keg-cli setup. Could not set keg-cli setup ENVs!"
    exit 1
  fi

}

# Call init setup to start the setup proccess
keg_init_setup "$@"