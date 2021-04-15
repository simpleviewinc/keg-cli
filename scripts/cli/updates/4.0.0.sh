
#!/usr/bin/env

source $(pwd)/keg

source $(pwd)/scripts/cli/updates/update_helpers.sh

keg_cli_4_0_0_update(){

  keg_message "Running update for version 4.0.0..."

  keg config sync
  keg config set --key cli.settings.defaultEnv --value local --confirm false
  keg cli env unset --key KEG_PROXY_HOST --confirm false --comment false
  keg cli env set --key KEG_PROXY_HOST --value \"{{ cli.settings.defaultEnv }}.{{ cli.settings.defaultDomain }}\" --confirm false

  echo ""
  keg_message "4.0.0 Update Complete!"
  echo ""

}

keg_cli_4_0_0_update "$@"

