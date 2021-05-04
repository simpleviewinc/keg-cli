##
## Description: sets up the current machine's environment to use the keg cli
## Expected ENVS:
##   - KEG_CLI_PATH: (optional) path to the root keg-cli directory (defaults to current directory)
##   - KEG_CLI_USER: docker login user
##   - GIT_TOKEN: git token for interacting with github repos and docker registry

if [[ ! -z "$KEG_CLI_PATH" ]]; then
  cd $KEG_CLI_PATH
fi

if [[ -z "$KEG_CLI_USER" ]]; then
  echo "Env KEG_CLI_USER is required"
  exit 1
fi

if [[ -z "$GIT_TOKEN" ]]; then
  echo "Env GIT_TOKEN is required"
  exit 1
fi

yarn install

## setup config and keg-hub
USER=$KEG_CLI_USER bash ./scripts/ci/setupCLIConfig.sh

source ./keg

keg git key add --value $GIT_TOKEN --confirm false

git config --global user.name $KEG_CLI_USER

## login to docker
keg dp login