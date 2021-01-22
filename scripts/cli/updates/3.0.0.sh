
#!/usr/bin/env

source $(pwd)/keg

source $(pwd)/scripts/cli/updates/update_helpers.sh

keg_cli_3_0_0_update(){

  keg_message "Running update for version 3.0.0..."

  # Remove all running containers and clean out all images
  keg_destroy_all_docker

  # Remove node_modules, and re-install
  yarn clean:full

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

  keg cli env set --key GIT_HUB_URL --value https://github.com/simpleviewinc/keg-hub.git --confirm false
  keg cli env set --key GIT_HUB_BRANCH --value develop --confirm false
  
  keg cli env set --key GIT_CLI_URL --value https://github.com/simpleviewinc/keg-cli.git.git --confirm false
  keg cli env set --key GIT_CLI_BRANCH --value master --confirm false
  
  keg cli env set --key KEG_BASE_IMAGE --value ghcr.io/simpleviewinc/keg-base:master --confirm false
  keg cli env set --key KEG_IMAGE_FROM --value ghcr.io/simpleviewinc/keg-base:master --confirm false
  keg cli env set --key KEG_IMAGE_TAG --value master --confirm false
  

  # Update the globalConfig
  keg config set --key cli.settings.docker.imagePullPolicy --value Always --confirm false
  keg config set --key cli.settings.docker.defaultTag --value master --confirm false
  keg config set --key cli.settings.docker.defaultLocalBuild --value false --confirm false
  
  keg config set --key version --value 3.0.0 --confirm false


  echo ""
  keg_message "3.0.0 Update Complete!"
  echo ""

}

keg_cli_3_0_0_update "$@"