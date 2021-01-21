#!/usr/bin/env


# If the no KEG_DOCKER_EXEC env is set, just sleep forever
# This is to keep our container running forever
if [[ -z "$KEG_DOCKER_EXEC" ]]; then
  tail -f /dev/null
  exit 0

else

  # Cd into the tap repo
  cd $DOC_APP_PATH

  # Ensure there is a command to run
  if [[ -z "$KEG_EXEC_CMD" ]]; then
    KEG_EXEC_CMD="start"
  fi

  # Start the tap instance
  echo $"[ KEG-CLI ] Running command 'yarn $KEG_EXEC_CMD'" >&2
  yarn $KEG_EXEC_CMD

fi
