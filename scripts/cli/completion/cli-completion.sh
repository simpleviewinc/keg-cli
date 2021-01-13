#!/usr/bin/env bash

# complete -W "core components docker tap evf" keg
# Copy script to /etc/bash_completion.d/

#/usr/bin/env bash
keg_cli_completions(){
  local COMP_CMD="node $KEG_CLI_PATH/scripts/cli/completion/completion.js"

  COMPREPLY=($(compgen -W "$($COMP_CMD ${COMP_WORDS[@]})"))

}

complete -F keg_cli_completions keg

