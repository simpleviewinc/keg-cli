
#!/usr/bin/env

source $(pwd)/keg

source $(pwd)/scripts/cli/updates/update_helpers.sh

keg_cli_5_2_0_update(){

  keg_message "Running update for version 5.2.0..."

  keg config sync --conflict local --no-confirm

  echo ""
  keg_message "5.2.0 Update Complete!"
  echo ""

}

keg_cli_5_2_0_update "$@"
