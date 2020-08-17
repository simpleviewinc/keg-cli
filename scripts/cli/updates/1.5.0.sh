#!/usr/bin/env

source $(pwd)/keg

source $(pwd)/scripts/cli/updates/update_helpers.sh

keg_cli_1_5_0_update(){

  keg_message "Running update for version 1.5.0..."

  local RUNNING_CONT="$(command docker ps -aq)"
  if [[ "$RUNNING_CONT" ]]; then
    keg_error "All docker containers must be stopped before updating!"
    return
  fi
  
  keg_docker_clean "$@"

  # Resync the global config
  keg config sync --confirm false
  keg config unset --key cli.paths.regulator --confirm false
  keg cli env unset --key GIT_REGULATOR_URL --confirm false --comment false
  keg cli env unset --key DOC_REGULATOR_PATH --confirm false --comment false

  keg d build base --cache false

  echo ""
  keg_message "1.5.0 Update Complete!"
  echo ""

}

keg_cli_1_5_0_update "$@"
