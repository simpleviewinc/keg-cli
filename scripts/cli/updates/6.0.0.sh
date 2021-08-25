
#!/usr/bin/env

source $(pwd)/keg

source $(pwd)/scripts/cli/updates/update_helpers.sh

keg_cli_6_0_0_update(){

  keg_message "Running update for version 6.0.0..."

  keg cli env unset --key KEG_PROXY_ENTRY --force --no-confirm
  keg config set --key cli.settings.tapAsProxy --value proxy --no-confirm
  
  echo ""
  keg_message "6.0.0 Update Complete!"
  echo ""

}

keg_cli_6_0_0_update "$@"
