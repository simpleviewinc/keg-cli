#!/bin/bash

# Exit when any command fails
set -e

# Get the keg-cli path from the current directory
# Should be something like this in the workflow => /home/runner/work/keg-cli/keg-cli
export KEG_CLI_PATH=$(pwd)
echo "::debug::Keg-CLI root directory => $KEG_CLI_PATH"

export KEG_GLOBAL_CONFIG=$KEG_CLI_PATH/.kegConfig/cli.config.json
echo "::debug::Keg-CLI config file => $KEG_GLOBAL_CONFIG"

# Loop over the repos and run the passed in command on them
keg_run_yarn_cmd(){
  echo "::debug::Running yarn cmd $1"
  yarn "$1"
}

keg_run_yarn_cmd "$@"
