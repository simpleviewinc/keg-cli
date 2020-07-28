#!/usr/bin/env

keg_message(){
  echo $"[ KEG-CLI ] $1" >&2
  return
}


# Helper to run novnv for firefix and chrome
# This allows us to load the VM within a browser
keg_run_novnc_apps(){

  # Ensure the required ENVS exist
  if [[ -z "$NO_VNC_CHROME_PORT" ]]; then
    NO_VNC_CHROME_PORT=7070
  fi

  if [[ -z "$CHROME_VNC_PORT" ]]; then
    CHROME_VNC_PORT=5900
  fi

  if [[ -z "$NO_VNC_FIREFOX_PORT" ]]; then
    NO_VNC_FIREFOX_PORT=7071
  fi

  if [[ -z "$FIREFOX_VNC_PORT" ]]; then
    FIREFOX_VNC_PORT=5901
  fi

  if [[ -z "$DOC_NOVNC_PATH" ]]; then
    DOC_NOVNC_PATH=/keg/keg-vnc
  fi

  if [[ -z "$NO_VNC_HOST" ]]; then
    NO_VNC_HOST=regulator.kegdev.xyz
  fi

  # Start novnc for chrome
  if [[ "$NO_VNC_CHROME_URL" ]]; then
    keg_message "Starting VNC for chrome => http://$NO_VNC_HOST:$NO_VNC_CHROME_PORT/vnc.html?host=$NO_VNC_HOST&port=$NO_VNC_CHROME_PORT"
  fi
  $DOC_NOVNC_PATH/utils/launch.sh --listen $NO_VNC_CHROME_PORT --vnc regulator.kegdev.xyz:$CHROME_VNC_PORT --web $DOC_NOVNC_PATH/ &>/dev/null &

  # Start novnc for firefox
  if [[ "$NO_VNC_FIREFOX_URL" ]]; then
    keg_message "Starting VNC for chrome => http://$NO_VNC_HOST:$NO_VNC_FIREFOX_PORT/vnc.html?host=$NO_VNC_HOST&port=$NO_VNC_FIREFOX_PORT"
  fi
  $DOC_NOVNC_PATH/utils/launch.sh --listen $NO_VNC_FIREFOX_PORT --vnc regulator.kegdev.xyz:$FIREFOX_VNC_PORT --web $DOC_NOVNC_PATH/ &>/dev/null &

}

TEST_PATH=/keg/keg-regulator

# Overwrite the default cli, core, regulator paths with passed in ENVs
keg_set_container_paths(){

  if [[ "$DOC_APP_PATH" ]]; then
    TEST_PATH="$DOC_APP_PATH"
  fi

}

# Add .npmrc so node_modules installs does not fail
keg_add_git_key(){
  git config --global url.https://$GIT_KEY@github.com/.insteadOf https://github.com/
  echo "@simpleviewinc:registry=https://npm.pkg.github.com/" > .npmrc
  echo "//npm.pkg.github.com/:_authToken=${GIT_KEY}" >> .npmrc
}

# Remove .npmrc so git key is not saved
keg_remove_git_key(){
  git config --global url.https://github.com/.insteadOf url.https://$GIT_KEY@github.com/
  rm -rf .npmrc
}


# Runs yarn install at run time
# Use when adding extra node_modules to keg-core without rebuilding
keg_run_regulator_yarn_setup(){

  # Check if $KEG_NM_INSTALL exist, if it doesn't, then return
  if [[ -z "$KEG_NM_INSTALL" ]]; then
    return
  fi

  # Navigate to the cached directory, and run the yarn install here
  cd $TEST_PATH
  keg_message "Running yarn setup for regulator..."
  keg_add_git_key
  yarn install
  keg_remove_git_key

}

# Runs a Tap
keg_run_the_regulator(){

  cd $TEST_PATH

  if [[ -z "$KEG_EXEC_CMD" ]]; then
    KEG_EXEC_CMD="cli"
  fi

  keg_message "Running command 'yarn $KEG_EXEC_CMD'"
  yarn $KEG_EXEC_CMD

}

# If the sleep arg is passed, just sleep forever
# This is to keep our container running forever
if [[ "$1" == "sleep" ]]; then
  tail -f /dev/null
  exit 0

else

  # Check if we are running noVnc, and if so setup the noVnc service
  if [[ "$SELENIUM_VNC" == "-debug" ]]; then
    keg_run_novnc_apps
  fi

  # Checks for path overrides of the core, tap paths with passed in ENVs
  keg_set_container_paths

  # Run yarn setup for any extra node_modules from the mounted regulator's package.json
  keg_run_regulator_yarn_setup

  # Start the keg regulator cli
  keg_run_the_regulator

fi



