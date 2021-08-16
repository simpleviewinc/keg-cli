
#!/usr/bin/env

source $(pwd)/keg

source $(pwd)/scripts/cli/updates/update_helpers.sh

keg_cli_5_2_0_update(){

  keg_message "Running update for version 5.0.0..."

  keg config sync
  keg cli env set --key EXPO_CLI_VERSION --value 4.10.0 --confirm false --comment false
  keg cli env set --key SHARP_CLI_VERSION --value 1.15.0 --confirm false --comment false

  echo ""
  keg_message "5.0.0 Update Complete!"
  echo ""

}

keg_cli_5_2_0_update "$@"
