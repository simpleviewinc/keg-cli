
#!/usr/bin/env

source $(pwd)/keg

source $(pwd)/scripts/cli/updates/update_helpers.sh

keg_cli_3_0_0_update(){

  keg_message "Running update for version 3.0.0..."

  # Remove all running containers and clean out all images
  keg_destroy_all_docker

  # Remove node_modules, and re-install
  yarn install

  # Update the DEFUALT ENVs
  keg cli env unset --key EXPO_DEBUG_PORT --confirm false --comment false
  keg cli env unset --key EXPO_APP_PORT --confirm false --comment false
  keg cli env unset --key KEG_BASE_IMAGE --confirm false --comment false
  keg cli env unset --key KEG_BASE_URL --confirm false --comment false
  keg cli env unset --key KEG_BASE_VERSION --confirm false --comment false
  keg cli env unset --key KEG_IMAGE_FROM --confirm false --comment false
  keg cli env unset --key KEG_IMAGE_TAG --confirm false --comment false
  keg cli env unset --key RN_PACKAGER_IP --confirm false --comment false

  # Clean up git ENVs
  keg cli env unset --key GIT_HUB_URL --confirm false --comment false
  keg cli env unset --key GIT_HUB_BRANCH --confirm false --comment false
  keg cli env unset --key GIT_CLI_URL --confirm false --comment false
  keg cli env unset --key GIT_CORE_URL --confirm false --comment false
  keg cli env unset --key GIT_COMPONENTS_URL --confirm false --comment false
  keg cli env unset --key GIT_RESOLVER_URL --confirm false --comment false
  keg cli env unset --key GIT_PROXY_URL --confirm false --comment false

  keg cli env set --key GIT_HUB_URL --value \"{{ cli.git.orgUrl }}/{{ cli.git.repos.hub }}.git\" --confirm false
  keg cli env set --key GIT_HUB_BRANCH --value develop --confirm false
  keg cli env set --key GIT_CLI_URL --value \"{{ cli.git.orgUrl }}/{{ cli.git.repos.cli }}.git\" --confirm false
  keg cli env set --key GIT_CLI_BRANCH --value master --confirm false

  # Update default image envs
  keg cli env set --key KEG_BASE_IMAGE --value \"ghcr.io/simpleviewinc/keg-base:{{ cli.settings.docker.defaultTag }}\" --confirm false
  keg cli env set --key KEG_IMAGE_FROM --value \"ghcr.io/simpleviewinc/keg-base:{{ cli.settings.docker.defaultTag }}\" --confirm false
  keg cli env set --key KEG_IMAGE_TAG --value \"{{ cli.settings.docker.defaultTag }}\" --confirm false

  # Update the globalConfig
  keg config set --key cli.settings.docker.imagePullPolicy --value Always --confirm false
  keg config set --key cli.settings.docker.defaultTag --value master --confirm false
  keg config set --key cli.settings.docker.defaultLocalBuild --value false --confirm false

  keg config set --key version --value 3.0.0 --confirm false
  keg config set --key cli.git.orgUrl --value \"https://github.com/simpleviewinc\" --confirm false
  keg config set --key cli.git.repos.hub --value keg-hub --confirm false
  keg config set --key cli.git.repos.cli --value keg-cli --confirm false
  
  # Update the docker config to use the new settings
  keg config set --key docker.providerUrl --value ghcr.io --confirm false
  keg config set --key docker.namespace --value simpleviewinc --confirm false

  # Run a sync after the envs have been updated
  keg config sync --confirm false

  # Auto-login the user to docker
  keg docker provider login

  echo ""
  keg_message "3.0.0 Update Complete!"
  echo ""

}

keg_cli_3_0_0_update "$@"