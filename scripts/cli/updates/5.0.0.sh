
#!/usr/bin/env

source $(pwd)/keg

source $(pwd)/scripts/cli/updates/update_helpers.sh

keg_remove_components_envs(){
  keg cli env unset --key COMPONENTS_PATH --confirm false --comment false
  keg cli env unset --key DOC_COMPONENTS_PATH --confirm false --comment false
  keg config unset --key cli.paths.components --confirm false
}

keg_link_components(){
  keg 
  cd repos/keg-components
  keg tap link components
}

keg_cli_5_0_0_update(){

  keg_message "Running update for version 5.0.0..."

  keg config sync
  keg_remove_components_envs
  keg_link_components

  echo ""
  keg_message "5.0.0 Update Complete!"
  echo ""

}

keg_cli_5_0_0_update "$@"

